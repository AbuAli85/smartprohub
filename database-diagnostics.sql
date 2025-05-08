-- Diagnostic script to check for provider_id columns
DO $$
DECLARE
    tables_to_check TEXT[] := ARRAY['profiles', 'provider_clients', 'provider_services', 
                                   'provider_availability', 'bookings', 'contracts', 
                                   'conversations', 'messages', 'services'];
    current_table TEXT;
    column_exists BOOLEAN;
BEGIN
    RAISE NOTICE 'Starting column existence check...';
    
    FOREACH current_table IN ARRAY tables_to_check
    LOOP
        EXECUTE format('SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = %L AND column_name = %L
        )', current_table, 'provider_id') INTO column_exists;
        
        IF column_exists THEN
            RAISE NOTICE 'Table % has provider_id column', current_table;
        ELSE
            RAISE NOTICE 'Table % is MISSING provider_id column', current_table;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Column check complete.';
END $$;
