# Christmas Carols Selection App

A Next.js web application that enables users to select and publish Christmas carols for a specific branch. Each selected carol is marked as "selected" and becomes unavailable for selection by other branches.

## Features

- ðŸŽ„ Branch-based carol selection
- ðŸ”’ Exclusive carol selection (once selected, unavailable for others)
- ðŸ“Š View selected carols by branch
- ðŸ’¾ Persistent data storage using JSON file
- ðŸŽ¨ Beautiful UI with Tailwind CSS
- âš¡ Fast and responsive design

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository or navigate to the project directory:
```bash
cd christmas-carols-selection
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create the data directory (if it doesn't exist):
```bash
mkdir -p data
```

The initial carols data file (`data/carols.json`) should be created automatically when you first run the application.

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
christmas-carols-selection/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â””â”€â”€ carols/
â”‚   â”‚       â”œâ”€â”€ route.ts          # GET endpoint for fetching carols
â”‚   â”‚       â””â”€â”€ select/
â”‚   â”‚           â””â”€â”€ route.ts      # POST endpoint for selecting carols
â”‚   â”œâ”€â”€ layout.tsx                # Root layout with Context Provider
â”‚   â””â”€â”€ page.tsx                  # Main page component
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ BranchForm.tsx            # Branch name input form
â”‚   â””â”€â”€ CarolList.tsx             # Carol selection and display component
â”œâ”€â”€ context/
â”‚   â””â”€â”€ CarolsContext.tsx         # React Context for state management
â”œâ”€â”€ data/
â”‚   â””â”€â”€ carols.json               # JSON file for data persistence
â”œâ”€â”€ styles/
â”‚   â””â”€â”€ globals.css               # Global styles with Tailwind
â”œâ”€â”€ package.json
â”œâ”€â”€ tsconfig.json
â”œâ”€â”€ tailwind.config.js
â””â”€â”€ next.config.js
```

## Usage

1. **Enter Branch Name**: Start by entering your branch name in the form and clicking "Submit".

2. **Select Carols**: Once your branch is set, you'll see:
   - Available carols that can be selected
   - Your selected carols (if any)
   - Carols selected by other branches (marked as unavailable)

3. **Select a Carol**: Click the "Select" button next to any available carol to assign it to your branch.

4. **View Selections**: Your selected carols will appear in the "Your Selected Carols" section, and they will be removed from the available carols list.

## Data Persistence

The application uses:
- **Local Development**: JSON file (`data/carols.json`) for data storage
- **Production (Vercel)**: Vercel KV (Redis-based key-value store) for data storage

The storage layer automatically detects the environment and uses the appropriate storage method.

## Building for Production

Create an optimized production build:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm start
# or
yarn start
```

## Deployment

### Deploying to Vercel

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy the application**:
```bash
vercel
```

Follow the prompts to complete the deployment. Vercel will automatically:
- Detect Next.js
- Configure build settings
- Deploy your application

4. **For production deployment**:
```bash
vercel --prod
```

### Alternative: Deploy via Vercel Dashboard

1. Push your code to GitHub, GitLab, or Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Vercel will automatically detect Next.js and configure the project
6. Click "Deploy"

### Important Notes for Deployment

âš ï¸ **File System Limitations**: The current implementation uses a JSON file for data storage. On serverless platforms like Vercel, the file system is read-only except for `/tmp`. 

#### Setting Up Vercel KV (Required for Production)

1. **Create a Vercel KV Database**:
   - Go to your Vercel project dashboard
   - Navigate to the "Storage" tab
   - Click "Create Database" and select "KV"
   - Follow the setup instructions

2. **Environment Variables** (automatically set by Vercel):
   - `KV_REST_API_URL` - KV REST API URL
   - `KV_REST_API_TOKEN` - KV REST API token
   - `KV_REST_API_READ_ONLY_TOKEN` - KV REST API read-only token

   These are automatically added when you create a KV database in Vercel.

3. **Migrate Existing Data** (if you have data in `data/carols.json`):
   ```bash
   # Install tsx if not already installed
   npm install -g tsx
   
   # Run migration script (set env vars first)
   npx tsx scripts/migrate-to-kv.ts
   ```

#### How It Works

- **Local Development**: Uses `data/carols.json` file system storage
- **Production (Vercel)**: Automatically uses Vercel KV when `KV_REST_API_URL` is set
- **Fallback**: If KV is not configured in production, you'll get a clear error message

### Alternative: Using MongoDB

If you prefer MongoDB instead of Vercel KV:

1. Install MongoDB driver:
```bash
npm install mongodb
```

2. Update `lib/storage.ts` to use MongoDB instead of KV

3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string

## Customization

### Adding More Carols

Edit `data/carols.json` and add new carol objects:
```json
{
  "id": 20,
  "name": "New Carol Name",
  "selected": false,
  "branch": null
}
```

### Styling

The application uses Tailwind CSS. Customize colors and styles in `tailwind.config.js`.

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Context API** - State management
- **Vercel KV** - Data persistence in production (Redis-based key-value store)
- **File System API** - Data persistence in local development (JSON file)

## Troubleshooting

### Issue: Data not persisting

**In Production (Vercel):**
- Ensure Vercel KV is set up and environment variables are configured
- Check Vercel project settings → Environment Variables
- Verify `KV_REST_API_URL` is set

**In Local Development:**
- Ensure the `data` directory has write permissions
- Check that `data/carols.json` exists and is writable

### Issue: "EROFS: read-only file system" error
This error occurs when trying to write to the file system in a serverless environment. The app now automatically uses Vercel KV in production. Make sure:
1. Vercel KV database is created in your Vercel project
2. Environment variables are set (automatically done when creating KV)
3. Run the migration script if you have existing data

### Issue: Carols not updating
- Refresh the page to reload data from the server
- Check browser console for errors
- Verify API routes are working correctly

### Issue: Build errors
- Ensure all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run build`
- Verify Node.js version is 18 or higher

## License

This project is open source and available for use.

## Support

For issues or questions, please open an issue in the repository.

---

**Merry Christmas! ðŸŽ„ðŸŽ…**
