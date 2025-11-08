-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  branch_name TEXT NOT NULL,
  team TEXT NOT NULL,
  carol_ids INTEGER[] NOT NULL,
  custom_carol_text TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on branch_name and team for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_branch ON submissions(branch_name);
CREATE INDEX IF NOT EXISTS idx_submissions_team ON submissions(team);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists (to avoid conflicts on re-run)
DROP POLICY IF EXISTS "Allow all operations for anon users" ON submissions;

-- Create policy to allow all operations (since we're using anon key)
CREATE POLICY "Allow all operations for anon users" ON submissions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists (to avoid conflicts on re-run)
DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_submissions_updated_at();

