-- Add document fields to contracts table
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS document_name TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS value DECIMAL(10, 2);

-- Create contract_analyses table
CREATE TABLE IF NOT EXISTS contract_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE NOT NULL,
  summary TEXT,
  risks JSONB,
  recommendations JSONB,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policy for contract_analyses
ALTER TABLE contract_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analyses for their contracts"
  ON contract_analyses FOR SELECT
  USING (
    contract_id IN (
      SELECT id FROM contracts WHERE user_id = auth.uid()
    )
  );
