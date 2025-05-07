# SmartPRO Business Services Hub - Integrations

This document provides information about the integrations used in the SmartPRO Business Services Hub.

## Supabase

Supabase provides the authentication and database functionality for the application.

### Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Set up the following environment variables:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   \`\`\`
3. Run the database setup scripts:
   - `database-setup.sql` - Initial database setup
   - `database-updates.sql` - Additional tables for integrations

## Vercel Blob

Vercel Blob is used for file storage, particularly for contract documents.

### Setup

1. Add the Blob integration to your Vercel project
2. The integration will automatically set up the `BLOB_READ_WRITE_TOKEN` environment variable

### Usage

Files are uploaded via the `/api/upload` endpoint, which uses the Vercel Blob SDK to store files securely.

## Groq

Groq provides AI capabilities for contract analysis and other intelligent features.

### Setup

1. Add the Groq integration to your Vercel project
2. The integration will automatically set up the `GROQ_API_KEY` environment variable

### Usage

The AI functionality is accessed via the `/api/ai/analyze-contract` endpoint, which uses the AI SDK with Groq to analyze contract text.

## Additional Configuration

For local development, you'll need to set up these environment variables in your `.env.local` file:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
BLOB_READ_WRITE_TOKEN=your_blob_token
GROQ_API_KEY=your_groq_api_key
\`\`\`

For production, these variables should be set in your Vercel project settings.
