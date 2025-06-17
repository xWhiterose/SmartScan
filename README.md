# ScanSmart - Barcode Nutrition Scanner

A modern, responsive web application for intelligent product analysis with barcode scanning capabilities. Features multi-mode scanning for food, pet, and cosmetic products with nutritional insights and health recommendations.

## Features

- **Multi-Mode Scanning**: Food, Pet, and Cosmetic product analysis
- **Barcode Scanner**: Camera-based barcode detection using ZXing library
- **Nutritional Analysis**: Dual-view system showing values per 100g and total package
- **Health Recommendations**: AI-generated advice based on Nutri-Score and ingredients
- **Responsive Design**: Mobile-first approach optimized for all devices
- **Custom Weight Input**: Calculate nutrition for custom product weights

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Shadcn/ui
- **State Management**: TanStack Query
- **APIs**: Open Food Facts, Open Pet Food Facts, Open Beauty Facts
- **Deployment**: Vercel

## Deployment on Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier available)

### Steps

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/scansmart.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub account
   - Import your repository
   - Vercel will automatically detect Next.js and configure the build

3. **Environment Variables** (if needed):
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add any required API keys or configuration

### Build Configuration

The project includes:
- `vercel.json` - Vercel deployment configuration
- `next.config.js` - Next.js configuration with image domains
- API routes in `pages/api/` - Serverless functions for Vercel

### Automatic Deployments

Once connected to GitHub, Vercel will automatically deploy:
- Every push to `main` branch → Production deployment
- Every push to other branches → Preview deployments

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

- `GET /api/product/[barcode]?type=food|pet|cosmetic` - Get product information

## Project Structure

```
├── pages/                 # Next.js pages and API routes
│   ├── api/              # Serverless API functions
│   ├── product/          # Product detail pages
│   └── scanner.tsx       # Scanner page
├── client/src/           # React components and utilities
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utility functions
├── shared/              # Shared types and schemas
└── vercel.json          # Vercel configuration
```

## Features Overview

### Scanning Modes
- **Food Mode** (Orange): Analyzes food products via Open Food Facts
- **Pet Mode** (Red): Analyzes pet food via Open Pet Food Facts  
- **Beauty Mode** (Pink): Analyzes cosmetics via Open Beauty Facts

### Nutritional System
- **Per 100g View**: Standard nutritional values
- **Total Package View**: Calculated for actual product weight
- **Custom Weight Input**: Manual weight entry for unknown quantities
- **Swipe Navigation**: Touch-friendly switching between views

### Health Analysis
- **Nutri-Score Integration**: A-E grading system for food quality
- **Ingredient Analysis**: Identifies concerning ingredients
- **Personalized Advice**: Context-aware health recommendations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## License

MIT License - feel free to use this project for your own applications.