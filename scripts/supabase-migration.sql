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

