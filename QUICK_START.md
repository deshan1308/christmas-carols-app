# Quick Start Guide - Supabase Setup

## 🚀 Quick Setup (2 Steps)

### Step 1: Create Table in Supabase Dashboard (2 minutes)

1. **Open Supabase Dashboard**: https://supabase.com/dashboard/project/rkyzvcaqnfsmeblztytx
2. **Click "SQL Editor"** in the left sidebar
3. **Click "New Query"** button
4. **Copy ALL the SQL below** and paste it into the editor:

```sql
-- Create carols table
CREATE TABLE IF NOT EXISTS carols (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  selected BOOLEAN DEFAULT FALSE NOT NULL,
  branch TEXT,
  team TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on selected and branch for faster queries
CREATE INDEX IF NOT EXISTS idx_carols_selected ON carols(selected);
CREATE INDEX IF NOT EXISTS idx_carols_branch ON carols(branch);

-- Enable Row Level Security (RLS)
ALTER TABLE carols ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists (to avoid conflicts on re-run)
DROP POLICY IF EXISTS "Allow all operations for anon users" ON carols;

-- Create policy to allow all operations (since we're using anon key)
-- In production, you might want to restrict this based on your needs
CREATE POLICY "Allow all operations for anon users" ON carols
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists (to avoid conflicts on re-run)
DROP TRIGGER IF EXISTS update_carols_updated_at ON carols;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_carols_updated_at
  BEFORE UPDATE ON carols
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

5. **Click "Run"** (or press Ctrl+Enter / Cmd+Enter)
6. **Verify**: You should see "Success. No rows returned" - this is correct!

### Step 2: Migrate Your Data (30 seconds)

After Step 1 is complete, run this command:

```bash
npx tsx scripts/migrate-to-supabase.ts
```

You should see:
```
✓ Successfully migrated 19 carols to Supabase
✓ Migration verified successfully
✅ Migration completed successfully!
```

## ✅ That's It!

Your app is now connected to Supabase! The app will automatically:
- Use Supabase for all data operations
- Sync data across all users
- Work in production (no more EROFS errors!)

## 🧪 Test It

1. Start your dev server: `npm run dev`
2. Open http://localhost:3000
3. Try selecting a carol - it should save to Supabase!

## 🔍 Verify in Supabase

1. Go to **Table Editor** in Supabase dashboard
2. Click on **carols** table
3. You should see all 19 carols with their current status

## ❓ Troubleshooting

**"Could not find the table" error?**
→ Make sure you ran Step 1 first (create the table)

**Migration fails?**
→ Check that the SQL script ran successfully in Step 1
→ Verify your Supabase project is active

**Still seeing file system errors?**
→ Make sure the migration completed successfully
→ Check browser console for any errors

