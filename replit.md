# WORK NOW - Replit環境セットアップ状況

## Overview
"Work Now" is an instant matching & reward platform connecting workers with jobs. It aims to revolutionize the way people work by offering flexibility and immediate payment, while providing businesses with a reliable talent pool. The platform focuses on a seamless, intuitive user experience with a premium, mobile-first design.

**Business Vision**: To become the leading platform for flexible work and talent acquisition in Japan, empowering individuals with freedom in their work life and offering businesses agile staffing solutions.

## User Preferences
- **Communication Style**: I prefer clear, concise, and direct communication.
- **Coding Style**: I appreciate well-structured, maintainable code.
- **Workflow**: I prefer an iterative development approach, focusing on completing one feature at a time.
- **Interaction**: Please ask for confirmation before making significant architectural changes or adding new major dependencies.
- **Project Structure**: Do not make changes to the file `replit.nix`.
- **Database**: When working with the database, prioritize using the existing `PostgresService` for consistency.

## System Architecture
The "Work Now" platform comprises a FastAPI (Python) backend, a React + Vite + TypeScript frontend, and a PostgreSQL database.

### UI/UX Decisions
-   **Branding**: Unified branding under "Work Now" (space included).
    -   Logo: Turquoise background with "WORK NOW IN JAPAN".
    -   Primary Color Palette: Turquoise gradient theme (`#00C6A7` to `#007E7A`).
    -   Typography: `clamp()` for perfect mobile responsiveness.
    -   Icons: Lucide Icons for vector clarity, @heroicons/react for dashboards.
-   **Design System**:
    -   Tailwind CSS v3 for utility-first styling.
    -   Framer Motion for advanced animations (scroll parallax, spring physics, pulse glow, floating, staggered entrance).
    -   Responsive Design: Mobile-first approach.
-   **PWA**: Implemented with Vite PWA plugin for fullscreen display, service worker, and optimized mobile metadata.
-   **Key UI Components**:
    -   **Buttons**: 5 variants (primary, secondary, outline, ghost, danger) with Framer Motion animations.
    -   **Cards**: Gradient backgrounds and hover effects.
    -   **Badges**: For status indication.
-   **Layouts**:
    -   `AppShell` with a gradient background.
    -   `Header` with user menus.
    -   `Footer` (desktop only).
    -   `BottomNav` (mobile only) with animation indicators.
-   **Landing Page**: Multi-layered background (gradient + glow sphere + grid) with advanced interactions and scroll effects.

### Technical Implementations
-   **Backend**: FastAPI (Python) running on port 8008.
    -   Comprehensive API endpoints for authentication, job management, application management, assignment management, payments, reviews, notifications, and admin functions.
    -   JWT for authentication and bcrypt for password hashing.
    -   Database interaction managed via `PostgresService` for CRUD operations, error handling, and transaction management.
    -   Robust PostgreSQL connection pooling with retry logic, health checks, and defensive rollback.
-   **Frontend**: React + Vite + TypeScript running on port 5000.
    -   React 19.2.0, Vite 7.2.2, React Router v7.
    -   State Management: Zustand 5.0.
    -   Data Fetching: TanStack Query v5.
    -   Persistent authentication tokens via localStorage.
    -   Role-based routing (`getDashboard()`) for different user types (worker, company, admin).
-   **Database**: Replit PostgreSQL.
    -   Seven core tables: `users`, `jobs`, `applications`, `assignments`, `payments`, `reviews`, `device_tokens`.
    -   Indexes implemented on all tables for performance.

### Feature Specifications
-   **Authentication**: Login, registration (worker/client flows), password reset, JWT token management.
-   **Dashboard**: Role-specific dashboards (worker, client, admin) with statistics, quick actions, and activity feeds.
-   **Job Management**: Create, update, delete, list jobs with status management.
-   **Application Management**: Create, update applications with status tracking.
-   **Assignment Management**: Track work assignments from start to completion.
-   **Payment Management**: Full Stripe Connect integration for worker payouts and payment history.
-   **Review System**: 1-5 star ratings with comments for mutual evaluation.
-   **Notifications**: Push notification readiness with device token management.

## External Dependencies

-   **Database**: Replit PostgreSQL
-   **Payment Gateway**: Stripe Connect (fully integrated)
-   **Icons**: Lucide Icons, @heroicons/react
-   **Push Notifications**: Firebase Cloud Messaging (integration ready)
-   **Caching/Queuing**: Redis (planned for caching)