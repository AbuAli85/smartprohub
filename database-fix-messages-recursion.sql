-- First, drop all policies on conversation_participants table
DROP POLICY IF EXISTS "conversation_participants_select_policy" ON "conversation_participants";
DROP POLICY IF EXISTS "conversation_participants_insert_policy" ON "conversation_participants";
DROP POLICY IF EXISTS "conversation_participants_update_policy" ON "conversation_participants";
DROP POLICY IF EXISTS "conversation_participants_delete_policy" ON "conversation_participants";

-- Then drop all policies on messages table
DROP POLICY IF EXISTS "messages_select_policy" ON "messages";
DROP POLICY IF EXISTS "messages_insert_policy" ON "messages";
DROP POLICY IF EXISTS "messages_update_policy" ON "messages";
DROP POLICY IF EXISTS "messages_delete_policy" ON "messages";

-- Create simple, non-recursive policies for messages
CREATE POLICY "messages_select_policy" ON "messages"
FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);

CREATE POLICY "messages_insert_policy" ON "messages"
FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);

CREATE POLICY "messages_update_policy" ON "messages"
FOR UPDATE USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);

-- Create simple policies for conversation_participants that don't reference messages
CREATE POLICY "conversation_participants_select_policy" ON "conversation_participants"
FOR SELECT USING (
  auth.uid() = user_id
);

CREATE POLICY "conversation_participants_insert_policy" ON "conversation_participants"
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);
