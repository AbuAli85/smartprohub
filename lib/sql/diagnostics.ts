import { sql } from "./index"

// This file contains SQL queries for database diagnostics
// These should be executed using the tagged template literal syntax

// SQL query to check table and column structure
export const getTableStructureSQL = () => sql`
  SELECT 
    table_name,
    column_name,
    data_type
  FROM 
    information_schema.columns
  WHERE 
    table_schema = 'public'
  ORDER BY 
    table_name, 
    ordinal_position;
`

// SQL query to check for missing provider_id columns
export const checkProviderIdColumnsSQL = () => sql`
  SELECT 
    table_name
  FROM 
    information_schema.tables
  WHERE 
    table_schema = 'public'
    AND table_name IN ('services', 'bookings', 'profiles', 'contracts')
    AND NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE 
        table_schema = 'public'
        AND columns.table_name = tables.table_name
        AND column_name = 'provider_id'
    );
`

// SQL query to check database version
export const getDatabaseVersionSQL = () => sql`
  SELECT version();
`
