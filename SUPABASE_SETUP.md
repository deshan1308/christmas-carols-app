# Supabase Setup Instructions

## Step 1: Create the Table in Supabase Dashboard

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `rkyzvcaqnfsmeblztytx`
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the entire contents of `scripts/supabase-migration.sql`
6. Click **Run** (or press Ctrl+Enter)

This will create:
- The `carols` table with all necessary columns
- Indexes for better query performance
- Row Level Security (RLS) policies
- Automatic timestamp updates

## Step 2: Run the Migration Script

After creating the table, run the migration script to populate it with your existing data:

```bash
npx tsx scripts/migrate-to-supabase.ts
```

This will:
- Read all carols from `data/carols.json`
- Insert/update them in your Supabase database
- Verify the migration was successful

## Step 3: Set Environment Variables (for Production)

For production deployments (e.g., Vercel), set these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: `https://rkyzvcaqnfsmeblztytx.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJreXp2Y2FxbmZzbWVibHp0eXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTkxMjIsImV4cCI6MjA3ODA3NTEyMn0.IOuO7F535TrAswI3Xa93oaC8Fx-tNng6BfmuxtcX0JU`

**Note**: The app will work locally without these variables (defaults are set), but you should set them in production for security.

## Verification

After migration, you can verify the data in Supabase:
1. Go to **Table Editor** in Supabase dashboard
2. Select the `carols` table
3. You should see all your carols with their current selections

## Troubleshooting

### Table already exists
If you get an error about the table already existing, that's fine - the migration script will just update the data.

### Migration fails
- Make sure you've run the SQL script first
- Check that your Supabase project is active
- Verify the API key is correct

### Data not syncing
- Check browser console for errors
- Verify environment variables are set correctly
- Make sure RLS policies allow operations (the default policy should work)

