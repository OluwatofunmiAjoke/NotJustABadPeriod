# Health Tracker - Medical Journey Management App

## Overview

This is a full-stack web application designed to help users track their health symptoms, manage medical timelines, and generate reports for healthcare providers. The app features a warm, empathetic design with optional faith-based elements, targeting users who need to monitor chronic conditions or prepare for medical appointments.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight routing library)
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with custom color scheme (warm cream/purple palette)
- **State Management**: TanStack React Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy and express-session
- **Password Security**: Node.js crypto with scrypt hashing
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### Mobile-First Design
- Responsive layout optimized for mobile devices
- Bottom navigation pattern for mobile UX
- Touch-friendly interface elements
- Progressive web app capabilities

## Key Components

### Database Schema
- **Users**: Authentication and preferences (faith mode, anonymous mode)
- **Symptom Logs**: Daily tracking (pain, fatigue, energy, mood, symptoms, medications, notes)
- **Medical Timeline**: Medical events (surgeries, diagnoses, visits, scans, tests)
- **Appointments**: Upcoming medical appointments
- **Health Tasks**: Task management for health-related activities
- **Expenses**: Medical expense tracking

### Authentication System
- Local username/password authentication
- Session-based authentication with PostgreSQL storage
- Password hashing using Node.js scrypt
- Protected routes with authentication middleware

### Core Features
- **Symptom Tracking**: Comprehensive daily logging with sliders and selectors
- **Medical Timeline**: Visual timeline of medical events with attachments
- **Insights Dashboard**: Data analysis and trend visualization
- **Quick Logging**: Simplified logging modal for rapid entry
- **Faith Mode**: Optional spiritual/religious content integration
- **Report Generation**: PDF-style medical reports for healthcare providers

## Data Flow

1. **User Authentication**: Login/register → Session creation → Protected route access
2. **Symptom Logging**: Form input → Validation → Database storage → Real-time updates
3. **Data Visualization**: Database queries → Data aggregation → Chart rendering
4. **Report Generation**: Data collection → HTML template → PDF-ready format

## External Dependencies

### Database & Hosting
- **PostgreSQL**: Primary database (configured for Neon serverless)
- **Replit**: Development and deployment platform

### NPM Packages
- **Frontend**: React ecosystem, Radix UI, TanStack Query, React Hook Form, Zod
- **Backend**: Express, Drizzle ORM, Passport.js, connect-pg-simple
- **Shared**: Date-fns for date handling, nanoid for ID generation

### Development Tools
- **TypeScript**: Type safety across the stack
- **Vite**: Frontend build tool with HMR
- **ESBuild**: Backend bundling for production
- **Tailwind CSS**: Utility-first styling
- **PostCSS**: CSS processing

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with tsx for TypeScript execution
- **Database**: PostgreSQL 16 module in Replit
- **Build Process**: Vite dev server with Express backend
- **Hot Reload**: Vite HMR for frontend, tsx watch for backend

### Production Environment
- **Build Command**: `npm run build` (Vite + ESBuild)
- **Start Command**: `npm run start` (compiled JavaScript)
- **Database**: Neon serverless PostgreSQL
- **Deployment**: Replit autoscale deployment target
- **Port Configuration**: Internal 5000, external 80

### Database Management
- **Schema Management**: Drizzle Kit for migrations
- **Push Command**: `npm run db:push` for schema updates
- **Connection**: Environment variable-based configuration

## Changelog

```
Changelog:
- June 23, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```