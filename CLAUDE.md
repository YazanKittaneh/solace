# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Development Tasks
- `npm i` - Install dependencies
- `npm run dev` - Start development server (runs on localhost:3000)
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint linter
- `npm run generate` - Generate Drizzle database migrations
- `npm run migrate:up` - Run database migrations
- `npm run seed` - Seed database with test data

### Database Setup
- `docker compose up -d` - Start PostgreSQL database
- `npx drizzle-kit push` - Push schema changes to database
- `curl -X POST http://localhost:3000/api/seed` - Seed database via API

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS
- **Language**: TypeScript with strict mode enabled

### Project Structure
- `/src/app/` - Next.js App Router pages and API routes
- `/src/db/` - Database configuration, schema, and seed data
- `/src/db/schema.ts` - Drizzle database schema definitions
- `/src/db/index.ts` - Database connection setup with fallback for no DB_URL

### Database Architecture
- **Schema**: Single `advocates` table with fields for personal info, specialties (JSONB), and experience
- **Connection**: Graceful fallback when `DATABASE_URL` is not configured
- **ORM**: Drizzle with postgres-js driver

### API Design
- `/api/advocates` - GET endpoint for fetching advocate data
- `/api/seed` - POST endpoint for seeding database
- Data source switches between database and static data based on DATABASE_URL configuration

### Frontend Architecture
- **Client-side**: React with hooks for state management
- **Data Fetching**: Direct fetch API calls to internal endpoints
- **Search**: Client-side filtering across multiple advocate fields
- **Styling**: Mix of inline styles and Tailwind classes

## Configuration Notes

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (optional, defaults to static data)
- Default URL format: `postgresql://postgres:password@localhost/solaceassignment`

### Database Schema
The `advocates` table includes:
- Personal info: firstName, lastName, city, phoneNumber
- Professional: degree, yearsOfExperience
- Specialties: JSONB array of medical/therapeutic specialties
- Timestamps: createdAt with automatic timestamp

### Search Implementation
Current search filters advocates by:
- Name fields (firstName, lastName)
- Location (city)
- Education (degree)
- Specialties array
- Years of experience

### Development Workflow
1. Database is optional - app works with static data by default
2. Uncomment database line in `/api/advocates/route.ts` to use real database
3. Seed data contains 15 sample advocates with randomized specialties