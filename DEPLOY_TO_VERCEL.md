# Deploy ScanSmart to Vercel - Runtime Error Fixed

## The Runtime Error Solution

The "Function Runtimes must have a valid version" error occurs when package.json contains Express dependencies that conflict with Vercel's serverless architecture.

## Solution Steps

### 1. Clean Package Dependencies
```bash
# Remove Express dependencies
npm uninstall express express-session connect-pg-simple memorystore passport passport-local ws
npm uninstall @types/express @types/express-session @types/passport @types/passport-local @types/ws

# Ensure Next.js is installed
npm install next@latest
```

### 2. Required Files for Vercel
Ensure these files exist:
- `pages/api/product/[barcode].ts` - API endpoint
- `pages/scanner.tsx` - Scanner page  
- `pages/product/[barcode].tsx` - Product page
- `next.config.js` - Next.js configuration
- `package.json` - Clean dependencies (no Express)

### 3. Deploy to Vercel
```bash
git add .
git commit -m "Clean Next.js build for Vercel"
git push origin main
```

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel detects Next.js automatically
4. Deploy with zero configuration

### 4. Troubleshooting Runtime Errors

If you still get runtime errors:
1. Check package.json has no Express dependencies
2. Ensure no vercel.json file exists
3. Verify all API routes are in `pages/api/` directory
4. Use only Next.js patterns (no Express middleware)

## Working Configuration

Your package.json should look like:
```json
{
  "name": "scansmart",
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
    // ... other React/UI dependencies
    // NO Express dependencies
  }
}
```

Your scanner app will deploy successfully on Vercel once Express dependencies are removed.