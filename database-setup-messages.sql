-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  
  -- Add indexes for better performance
  CONSTRAINT messages_sender_recipient_idx UNIQUE (sender_id, recipient_id, created_at)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_recipient_id_idx ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);

-- Add RLS policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see messages they've sent or received
CREATE POLICY messages_select_policy ON messages 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Policy to allow users to insert messages they're sending
CREATE POLICY messages_insert_policy ON messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Policy to allow users to update messages they've sent
CREATE POLICY messages_update_policy ON messages 
  FOR UPDATE 
  USING (auth.uid() = sender_id);
