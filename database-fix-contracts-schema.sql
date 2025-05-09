-- Add provider_id column to contracts table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contracts' 
        AND column_name = 'provider_id'
    ) THEN
        ALTER TABLE contracts ADD COLUMN provider_id UUID REFERENCES profiles(id);
    END IF;
END $$;

-- Add client_id column to contracts table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contracts' 
        AND column_name = 'client_id'
    ) THEN
        ALTER TABLE contracts ADD COLUMN client_id UUID REFERENCES profiles(id);
    END IF;
END $$;

-- Add effective_date column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contracts' 
        AND column_name = 'effective_date'
    ) THEN
        ALTER TABLE contracts ADD COLUMN effective_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add expiry_date column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contracts' 
        AND column_name = 'expiry_date'
    ) THEN
        ALTER TABLE contracts ADD COLUMN expiry_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add description column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contracts' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE contracts ADD COLUMN description TEXT;
    END IF;
END $$;

-- Add file_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contracts' 
        AND column_name = 'file_url'
    ) THEN
        ALTER TABLE contracts ADD COLUMN file_url TEXT;
    END IF;
END $$;

-- Create an index on provider_id for better performance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'contracts' 
        AND indexname = 'contracts_provider_id_idx'
    ) THEN
        CREATE INDEX contracts_provider_id_idx ON contracts(provider_id);
    END IF;
END $$;

-- Create an index on client_id for better performance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'contracts' 
        AND indexname = 'contracts_client_id_idx'
    ) THEN
        CREATE INDEX contracts_client_id_idx ON contracts(client_id);
    END IF;
END $$;
