# Submissions Table Setup

## Quick Setup

### Step 1: Create the Submissions Table in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/rkyzvcaqnfsmeblztytx
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `scripts/submissions-migration.sql`
5. Paste it into the editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned" - this is correct!

### Step 2: Verify It Works

After creating the table:
1. Make a new carol selection on the main page
2. Go to the Submissions page (`/submissions`)
3. You should see your submission with timestamp and details!

## What's Included

The submissions table stores:
- **Branch name** - Which branch made the submission
- **Team** - Team 1 or Team 2
- **Carol IDs** - Array of selected carol IDs
- **Custom carol text** - If a custom carol was submitted
- **Submitted at** - Timestamp of when the submission was made
- **Created/Updated at** - Automatic timestamps

## Features

- ✅ Automatic submission tracking when carols are selected
- ✅ View all submissions grouped by branch and team
- ✅ See submission timestamps
- ✅ Track custom carols separately
- ✅ Refresh button to reload submissions

## API Endpoints

- `GET /api/submissions` - Get all submissions
- `GET /api/submissions?branchName=Kandy` - Get submissions for a specific branch
- `POST /api/submissions` - Create a new submission (automatically called when selecting carols)

The submissions are automatically saved when you select carols through the bulk select API!

