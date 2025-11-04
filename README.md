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

The application uses a JSON file (`data/carols.json`) to store carol selections. This file is automatically created and updated when carols are selected.

**Note**: For production deployments, consider using a proper database (MongoDB, PostgreSQL, etc.) instead of a JSON file for better scalability and concurrent access handling.

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

**For production, you should:**
- Use a database (MongoDB, PostgreSQL, Firebase, etc.)
- Or use Vercel KV (key-value store)
- Or use a cloud storage service (AWS S3, etc.)

### Example: Using MongoDB

1. Install MongoDB driver:
```bash
npm install mongodb
```

2. Update API routes to use MongoDB instead of file system

3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string

### Environment Variables

If using a database, add your connection strings as environment variables in Vercel:
- Go to Project Settings â†’ Environment Variables
- Add your variables (e.g., `MONGODB_URI`, `DATABASE_URL`)

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
- **File System API** - Data persistence (JSON file)

## Troubleshooting

### Issue: Data not persisting
- Ensure the `data` directory has write permissions
- Check that `data/carols.json` exists and is writable

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
