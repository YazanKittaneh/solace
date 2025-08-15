# Requirements Document

## Feature: Landing Page User Flow

### Overview
Transform the current immediate advocate listing page into a more approachable landing page that starts with a conversational question, allowing users to describe their needs in natural language before presenting search results.

### User Stories

**Story 1: First-time User Experience**
As a person seeking healthcare advocacy support, I want to be greeted with a welcoming question rather than an overwhelming data table, so that I feel comfortable describing my needs in my own words.

**Story 2: Natural Language Input**
As a user unfamiliar with medical terminology, I want to be able to describe my situation in plain language (e.g., "I need help with my insurance claim" or "Looking for mental health support"), so that I don't have to guess the right search terms.

**Story 3: Progressive Disclosure**
As a user, I want the interface to guide me from expressing my needs to seeing relevant results, so that the experience feels conversational and less intimidating.

### EARS Requirements

**REQ-1.1**: The system SHALL display a landing page with the question "What do you need support with?" when a user first visits the homepage.
- **Acceptance Criteria**: Landing page loads with prominent question and text input field

**REQ-1.2**: The system SHALL allow users to enter free-form text describing their needs or situation.
- **Acceptance Criteria**: Text input accepts any string input up to 500 characters

**REQ-1.3**: The system SHALL intelligently search advocate profiles based on natural language input.
- **Acceptance Criteria**: Search algorithm matches user input against advocate specialties, experience areas, and related keywords

**REQ-1.4**: The system SHALL transition from the landing page to search results after user submits their query.
- **Acceptance Criteria**: User sees search results table after submitting their input, with option to refine search

**REQ-1.5**: The system SHALL provide suggested prompts or examples to help users understand what they can ask.
- **Acceptance Criteria**: Landing page shows 3-4 example prompts like "Help with insurance claims", "Mental health support", etc.

**REQ-1.6**: The system SHALL maintain the existing advocate search functionality for users who prefer structured search.
- **Acceptance Criteria**: Advanced/structured search option remains available as alternative interface

**REQ-1.7**: The system SHALL provide a way for users to return to the landing page from search results.
- **Acceptance Criteria**: "Start over" or "New search" button returns user to landing page

### Technical Constraints

- Must maintain existing API endpoints and data structure
- Should preserve current advocate data model and search capabilities
- Must be responsive and accessible
- Should maintain performance standards for search operations

### Non-Functional Requirements

**Performance**: Search results should appear within 300ms of query submission
**Accessibility**: Landing page must meet WCAG 2.1 AA standards
**Usability**: New user flow should reduce time-to-first-meaningful-result by 50%
**SEO**: Landing page should be optimized for search engines with appropriate meta tags

### Success Metrics

- Reduction in bounce rate on homepage
- Increase in search completion rate
- Improved user satisfaction scores
- Reduced time from landing to finding an advocate