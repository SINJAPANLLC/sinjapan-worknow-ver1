# WORK NOW - Replit環境セットアップ状況

## Overview
"Work Now" is an instant matching & reward platform connecting workers with jobs. It aims to revolutionize the way people work by offering flexibility and immediate payment, while providing businesses with a reliable talent pool. The platform focuses on a seamless, intuitive user experience with a premium, mobile-first design.

**Business Vision**: To become the leading platform for flexible work and talent acquisition in Japan, empowering individuals with freedom in their work life and offering businesses agile staffing solutions.

## User Preferences
-   **Communication Style**: I prefer clear, concise, and direct communication.
-   **Coding Style**: I appreciate well-structured, maintainable code.
-   **Workflow**: I prefer an iterative development approach, focusing on completing one feature at a time.
-   **Interaction**: Please ask for confirmation before making significant architectural changes or adding new major dependencies.
-   **Project Structure**: Do not make changes to the file `replit.nix`.
-   **Database**: When working with the database, prioritize using the existing `PostgresService` for consistency.

## System Architecture
The "Work Now" platform comprises a FastAPI (Python) backend, a React + Vite + TypeScript frontend, and a PostgreSQL database.

### UI/UX Decisions
-   **Branding**: Unified branding under "Work Now" with a Turquoise gradient theme (`#00CED1` to `#009999`). Typography uses `clamp()` for responsiveness.
-   **Design System**: Tailwind CSS v3 for utility-first styling, Framer Motion for animations, and a mobile-first responsive design. Implemented as a PWA with Vite PWA plugin.
-   **Key UI Components**: 5 variants of animated buttons, gradient cards, and badges.
-   **Layouts**: `AppShell` with gradient background, `Header`, `Footer` (desktop), and `BottomNav` (mobile).
-   **Landing Page**: Multi-layered background with advanced interactions and scroll effects.

### Technical Implementations
-   **Backend**: FastAPI (Python) on port 8008. Provides comprehensive API endpoints for authentication, job/application/assignment management, payments, reviews, notifications, and admin functions. Uses JWT for authentication, bcrypt for password hashing, and `PostgresService` for database interaction with robust connection pooling.
-   **Frontend**: React + Vite + TypeScript on port 5000. Utilizes React 19.2.0, Vite 7.2.2, React Router v7, Zustand 5.0 for state management, and TanStack Query v5 for data fetching. Supports persistent authentication via localStorage and role-based routing.
-   **Database**: Replit PostgreSQL with ten core tables (`users`, `jobs`, `applications`, `assignments`, `payments`, `reviews`, `device_tokens`, `bank_accounts`, `withdrawal_requests`, `activity_logs`) and indexes for performance. Extended user profile fields are included.

### Feature Specifications
-   **Authentication**: Login, registration (worker/client), password reset, JWT.
-   **Dashboards**: Role-specific (worker, client, admin) with stats and actions.
-   **Job Management**: CRUD operations for jobs with status management.
-   **Application & Assignment Management**: Create, update applications, track assignments.
-   **Payment Management**: Stripe Connect integration for payouts, bank account management (Japanese banking specifics), and a worker withdrawal system with status tracking.
-   **Profile Management**: Extended user profiles with personal details, phone verification, ID document upload, location features (prefecture, geolocation).
-   **Activity Tracking**: Comprehensive logging of user actions.
-   **Review System**: 1-5 star ratings with comments for mutual evaluation, integrated into profiles and assignment flows.
-   **Notifications**: Push notification readiness with device token management.
-   **QR Code System**: Secure QR-based check-in/check-out for assignments, with dynamic tokens and time limits.
-   **Job Filtering**: Advanced filtering by prefecture, date range, and sorting options (distance/rate/newest). Includes favorites and notification preferences.
-   **Worker Onboarding**: "Work Style Guide" page for new workers.

## External Dependencies

-   **Database**: Replit PostgreSQL
-   **Payment Gateway**: Stripe Connect
-   **Icons**: Lucide Icons, @heroicons/react
-   **Push Notifications**: Firebase Cloud Messaging (integration ready)
-   **Caching/Queuing**: Redis (planned)
-   **Geolocation**: Browser Geolocation API, OpenStreetMap Nominatim API (geocoding)

## Recent Changes

### November 8, 2025 - Urgent Jobs & Geocoding Implementation
-   **Urgent Jobs System**: Added `is_urgent` and `urgent_deadline` flags to jobs table. Urgent jobs are now prioritized in all job listings (ORDER BY is_urgent DESC).
-   **Automatic Geocoding**: Integrated OpenStreetMap Nominatim API for address-to-coordinates conversion. Jobs with `location` field are automatically geocoded on creation to populate `latitude` and `longitude` for map display.
-   **Job Card Navigation**: Worker dashboard job cards are now clickable and navigate to `/jobs/{id}` detail page with hover/active animations.
-   **Online Workers Display**: Client dashboard now shows real-time list of online workers with auto-refresh every 30 seconds. Companies can see worker availability instantly.
-   **Backend Enhancements**: Added `GET /auth/workers/online` endpoint for companies/admins. Updated job service to handle async geocoding.
-   **UI Improvements**: Removed demand indicator, fixed mobile text overflow, added turquoise gradient styling (#00CED1 to #009999) for online worker cards.