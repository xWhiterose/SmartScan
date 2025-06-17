# NutriScan - Barcode Nutrition Scanner Application

## Overview

NutriScan is a full-stack web application that allows users to scan product barcodes to get nutritional information and health advice. The application uses a barcode scanner to identify products, fetches data from the Open Food Facts API, and provides Nutri-Score ratings with personalized health recommendations.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server:

- **Frontend**: React-based SPA with TypeScript, built with Vite
- **Backend**: Express.js REST API with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (configured but using in-memory storage currently)
- **Styling**: Tailwind CSS with Radix UI component library
- **Development Environment**: Replit with hot reloading

## Key Components

### Frontend Architecture
- **React Router**: Uses Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Barcode Scanning**: ZXing library for camera-based barcode detection
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend Architecture
- **RESTful API**: Express.js with TypeScript
- **Data Layer**: Drizzle ORM with PostgreSQL schema definitions
- **External Integration**: Open Food Facts API for product data
- **Storage Strategy**: In-memory storage (MemStorage) with database schema ready for production

### Database Schema
```typescript
products table:
- id (serial, primary key)
- barcode (text, unique)
- name (text)
- brand (text)
- imageUrl (text)
- nutriscoreGrade (text)
- calories (real)
- fat (real) 
- sugars (real)
- proteins (real)
- rawData (json)
```

### API Endpoints
- `GET /api/product/:barcode` - Fetch product information by barcode

## Data Flow

1. **Barcode Scanning**: User scans barcode using device camera
2. **Product Lookup**: Client requests product data from backend API
3. **Data Retrieval**: Server checks in-memory storage, falls back to Open Food Facts API
4. **Data Processing**: Nutritional data is extracted and standardized
5. **Health Analysis**: Nutri-Score grade generates personalized health advice
6. **Display**: Product information and recommendations shown to user

## External Dependencies

### Production Dependencies
- **React Ecosystem**: React 18, React Query, React Hook Form
- **UI Libraries**: Radix UI components, Lucide React icons
- **Utilities**: Date-fns, Class Variance Authority, Tailwind CSS
- **Backend**: Express.js, Drizzle ORM, Neon Database client
- **Barcode Processing**: ZXing library

### Development Dependencies
- **Build Tools**: Vite, ESBuild, TypeScript
- **Development**: TSX for TypeScript execution
- **Deployment**: Replit-specific plugins and configurations

## Start Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build for production (client + server)
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

## Deployment Strategy

**Platform**: Replit with autoscale deployment
**Build Process**: 
1. Vite builds the client-side React application
2. ESBuild bundles the server-side Express application
3. Static files served from `dist/public`
4. Server runs on port 5000 (mapped to external port 80)

**Environment Configuration**:
- Development: Hot reloading with Vite middleware
- Production: Static file serving with Express
- Database: PostgreSQL connection via DATABASE_URL environment variable

## Changelog

- June 17, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.