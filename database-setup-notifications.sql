-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action_url TEXT,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_name TEXT,
    metadata JSONB
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Create RLS policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Policy to allow users to update only their own notifications
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Function to create a notification when a new message is received
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
BEGIN
    -- Get the sender's name
    SELECT full_name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
    
    -- Create a notification for the recipient
    INSERT INTO public.notifications (
        user_id,
        title,
        content,
        type,
        sender_id,
        sender_name,
        action_url
    )
    VALUES (
        NEW.recipient_id,
        'New Message',
        CASE 
            WHEN LENGTH(NEW.content) > 50 THEN SUBSTRING(NEW.content, 1, 47) || '...'
            ELSE NEW.content
        END,
        'message',
        NEW.sender_id,
        sender_name,
        '/messages?conversation=' || NEW.conversation_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_message();

-- Add function to create booking notification
CREATE OR REPLACE FUNCTION create_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Get client and provider names
  DECLARE
    client_name TEXT;
    provider_name TEXT;
    service_name TEXT;
  BEGIN
    SELECT full_name INTO client_name FROM profiles WHERE id = NEW.client_id;
    SELECT full_name INTO provider_name FROM profiles WHERE id = NEW.provider_id;
    
    -- Create notification for provider
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content,
      sender_id,
      action_url
    ) VALUES (
      NEW.provider_id,
      'booking',
      'New booking from ' || client_name,
      'You have a new booking for ' || NEW.service_name || ' on ' || NEW.booking_date || ' at ' || NEW.start_time,
      NEW.client_id,
      '/provider/bookings'
    );
    
    -- Create notification for client
    INSERT INTO notifications (
      user_id,
      type,
      title,
      content,
      sender_id,
      action_url
    ) VALUES (
      NEW.client_id,
      'booking',
      'Booking confirmation',
      'Your booking for ' || NEW.service_name || ' with ' || provider_name || ' on ' || NEW.booking_date || ' at ' || NEW.start_time || ' has been created.',
      NEW.provider_id,
      '/client/bookings'
    );
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new bookings
DROP TRIGGER IF EXISTS trigger_create_booking_notification ON bookings;
CREATE TRIGGER trigger_create_booking_notification
AFTER INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION create_booking_notification();
