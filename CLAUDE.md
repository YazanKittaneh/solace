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
- Default URL format: `postgresql://postgres:password@localhost d/solaceassignment`

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


# Claude Code Spec-Driven Development

Kiro-style Spec Driven Development implementation using claude code slash commands, hooks and agents.

## Project Context

### Paths
- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`
- Commands: `.claude/commands/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context  
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications
- `nextjs-modernization` - Modernize codebase to conform to current Next.js standards and best practices
- Check `.kiro/specs/` for active specifications
- Use `/kiro:spec-status [feature-name]` to check progress

## Development Guidelines
- Think in English and generate responses in English

## Workflow

### Phase 0: Steering (Optional)
`/kiro:steering` - Create/update steering documents
`/kiro:steering-custom` - Create custom steering for specialized contexts

**Note**: Optional for new features or small additions. Can proceed directly to spec-init.

### Phase 1: Specification Creation
1. `/kiro:spec-init [detailed description]` - Initialize spec with detailed project description
2. `/kiro:spec-requirements [feature]` - Generate requirements document
3. `/kiro:spec-design [feature]` - Interactive: "requirements.mdをレビューしましたか？ [y/N]"
4. `/kiro:spec-tasks [feature]` - Interactive: Confirms both requirements and design review

### Phase 2: Progress Tracking
`/kiro:spec-status [feature]` - Check current progress and phases

## Development Rules
1. **Consider steering**: Run `/kiro:steering` before major development (optional for new features)
2. **Follow 3-phase approval workflow**: Requirements → Design → Tasks → Implementation
3. **Approval required**: Each phase requires human review (interactive prompt or manual)
4. **No skipping phases**: Design requires approved requirements; Tasks require approved design
5. **Update task status**: Mark tasks as completed when working on them
6. **Keep steering current**: Run `/kiro:steering` after significant changes
7. **Check spec compliance**: Use `/kiro:spec-status` to verify alignment

## Steering Configuration

### Current Steering Files
Managed by `/kiro:steering` command. Updates here reflect command changes.

### Active Steering Files
- `product.md`: Always included - Product context and business objectives
- `tech.md`: Always included - Technology stack and architectural decisions
- `structure.md`: Always included - File organization and code patterns

### Custom Steering Files
<!-- Added by /kiro:steering-custom command -->
<!-- Format: 
- `filename.md`: Mode - Pattern(s) - Description
  Mode: Always|Conditional|Manual
  Pattern: File patterns for Conditional mode
-->

### Inclusion Modes
- **Always**: Loaded in every interaction (default)
- **Conditional**: Loaded for specific file patterns (e.g., `"*.test.js"`)
- **Manual**: Reference with `@filename.md` syntax