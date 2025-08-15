# DISCUSSIONS.md

Thank you for looking over my project code. My inital implement of the project was based around handling large numbers of advocates, and making the table and search very quick. However, I quickly realized it doesn't matter how quick the table is, I am not going to scroll down a list of 10,000 enteries. So i've pivoted to building for the initial user experience. It boiled down to "tell me naturlaly what you want, and I'll share best matches". I leaned into Claude Code a lot because this project was easily translatable to the Kiro style spec driven development - which nicley counteracts the AI slop code most one shot agents provide. Here's a quick introduction to this system, followed by feature list, and finally future features.  

## Kiro Spec-Driven Development

### What is Kiro?
Kiro is a spec-driven development methodology that ensures systematic, well-documented feature implementation. It breaks down complex projects into manageable phases with clear requirements, design decisions, and implementation tasks. We are basically replicating Amazon's Kiro IDE implementation.


### How We Use Kiro
The `.kiro/` directory contains our project specifications, each following a structured format:
- **Requirements** - Clear business and technical requirements with acceptance criteria
- **Design** - Architectural decisions and technical approach documentation
- **Tasks** - Granular implementation steps with requirement traceability

### Why This Approach?

**Clarity**: Every feature starts with clear requirements before any code is written, preventing scope creep and ensuring alignment with business needs.

**Traceability**: Each task links back to specific requirements, making it easy to understand why code exists and what business value it provides.

**Progress Tracking**: Tasks can be marked as completed, providing clear visibility into project status and remaining work.

**Knowledge Transfer**: New engineers can quickly understand the project's architecture and reasoning by reviewing the specs, not just the code.

### Current Specifications
We're working with two main specifications:
1. **landing-page-user-flow** - Defines the conversational search interface for finding healthcare advocates
2. **nextjs-modernization** - Outlines the technical modernization to Next.js 14 with performance optimizations

## Recent Changes and Design Decisions

### 1. Added Results Table View for Search Results
**What:** Implemented a professional table view (`AdvocateTable.tsx`) that displays search results in a sortable, expandable table format instead of just returning raw data.

**Why:** Users needed a structured way to view and compare multiple advocates after searching. The table format makes it easier to scan through results, sort by different criteria (name, location, experience), and access detailed information through expandable rows.

### 2. Implemented View Mode Transition System
**What:** Created a transition system that switches from the conversational landing page interface to a dedicated results view with filter bar and table after search.

**Why:** The conversational interface is great for initial search input, but once users have results, they need a professional interface focused on reviewing and refining their options. This separation provides the best experience for each stage of the user journey.

### 3. Added Search Refinement Filter Bar
**What:** Built a sticky header bar (`SearchFilterBar.tsx`) that appears in results view with search refinement capabilities, quick filters, and result count.

**Why:** Users often need to refine their initial search after seeing results. The filter bar keeps search context visible and allows quick adjustments without returning to the landing page, improving workflow efficiency.


## Design Philosophy

These changes follow a user-centric approach where:
- The interface adapts to the user's current task (searching vs. reviewing results)
- Visual feedback is clear but not disruptive (white backgrounds, smooth transitions)
- Common workflows are optimized (search refinement, sorting, contact actions)
- Professional appearance is maintained throughout all states

## Future Considerations

### Immediate Enhancements
- Consider adding persistent search history for returning users
- Explore advanced filtering options (multiple specialties, distance radius)
- Potentially add saved searches or favorite advocates functionality
- Consider pagination or virtual scrolling for large result sets

### Remaining Tasks from Landing Page User Flow
- **Enhanced Search Results Display** - Build relevance scoring display with match highlighting and refined navigation
- **Search Refinement Component** - Create query modification interface with search history and breadcrumb navigation
- **No Results Handling** - Implement intelligent suggestions and fallback options when searches return no results
- **Advanced Search Toggle** - Add ability to switch between natural language and structured search modes
- **Performance Optimizations** - Implement caching, memoization, and lazy loading for sub-200ms search targets
- **Navigation Updates** - Update navigation to highlight landing page as primary entry point with breadcrumbs

### Remaining Tasks from Next.js Modernization
- **Server-Rendered Advocate List** - Build SSR-optimized page with virtual table and progressive enhancement
- **Real-time Search Component** - Implement debounced search with 300ms delay and suggestion system
- **Advanced Filtering Panel** - Create multi-select filters with URL state persistence
- **Cursor-Based Pagination** - Implement infinite scroll option with performance optimization
- **Full-Text Search Integration** - Connect search to PostgreSQL GIN indexes with ranking
- **Database Layer Optimization** - Add Redis caching, connection pooling, and performance indexes
- **API Layer Implementation** - Build comprehensive REST APIs for advocates, search, and filtering
- **Performance Monitoring** - Add Core Web Vitals tracking and real user monitoring
- **Testing Suite** - Create unit, integration, component, and E2E tests for 85%+ coverage
- **Error Handling System** - Implement error boundaries with graceful degradation
- **Mobile Optimization** - Create touch-optimized interactions with responsive breakpoints
- **Security Implementation** - Add input validation, rate limiting, and security headers

### Infrastructure Improvements
- **Database Schema Enhancement** - Implement PostgreSQL full-text search with tsvector columns
- **Caching Strategy** - Add Redis caching layer with intelligent invalidation
- **Connection Pooling** - Optimize database connections for performance
- **Migration System** - Create automated database migration and rollback procedures
- **Monitoring & Analytics** - Implement comprehensive performance and user behavior tracking