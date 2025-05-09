-- Drop any existing RLS policies on messages table that might be causing recursion
DROP POLICY IF EXISTS messages_select_policy ON messages;
DROP POLICY IF EXISTS messages_insert_policy ON messages;
DROP POLICY IF EXISTS messages_update_policy ON messages;

-- Create simple RLS policies without recursion
CREATE POLICY messages_select_policy ON messages 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY messages_insert_policy ON messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY messages_update_policy ON messages 
  FOR UPDATE 
  USING (auth.uid() = sender_id);
