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
-   **Backend**: FastAPI (Python) on port 8008. Provides API endpoints for authentication, job/application/assignment management, payments, reviews, notifications, and admin functions. Uses JWT for authentication, bcrypt for password hashing, and `PostgresService` for database interaction.
-   **Frontend**: React + Vite + TypeScript on port 5000. Utilizes React 19.2.0, Vite 7.2.2, React Router v7, Zustand 5.0 for state management, and TanStack Query v5 for data fetching. Supports persistent authentication via localStorage and role-based routing.
-   **Database**: Replit PostgreSQL with fourteen core tables (`users`, `jobs`, `applications`, `assignments`, `payments`, `reviews`, `device_tokens`, `bank_accounts`, `withdrawal_requests`, `activity_logs`, `client_notification_preferences`, `client_invoice_settings`, `conversations`, `messages`) and indexes for performance. Messaging tables support conversation participants, message content, read status, and timestamps.

### Feature Specifications
-   **Authentication**: Login, registration (worker/client), password reset, JWT.
-   **Dashboards**: Role-specific (worker, client, admin) with stats and actions.
-   **Job Management**: CRUD operations for jobs with status management, including urgent job prioritization and geocoding integration. Job creation page includes fee information panel explaining platform fees (20%), transfer fees (¥330), and instant payment fees (5%).
-   **Application & Assignment Management**: Create, update applications, track assignments. Includes a Wolt-style delivery management system with status progression, route visualization, and real-time updates. Application cards display enriched job information. **Worker details in Applications Manage Page**: Enhanced with full profile view including contact details (email, phone with verification status), qualifications, preferences, and direct message button.
-   **Payment Management**: Stripe Connect integration for payouts, bank account management (Japanese banking specifics), worker withdrawal system with automatic payment creation and balance tracking.
-   **Profile Management**: Extended user profiles with personal details, phone verification, ID document upload with file size/type validation, emergency contacts, qualifications, location features, and password change functionality. **Profile Image Upload**: Full avatar upload functionality with image preview, camera icon button, and automatic profile update. Header displays user avatar. **Client My Page**: Full profile management with mobile-first slide-up modals for editing company information (name, phone, address), secure password change with validation, notification preferences (push/email toggles, notification type matrix), and invoice settings (company details, tax ID).
-   **Messaging System**: Full-featured messaging platform with conversation list, message threads, unread counts, and real-time updates. Backend supports conversation creation/retrieval and message sending/reading. Frontend includes shared MessagesPage and client-specific implementation with deep-linking support (auto-opens conversations from worker_id query parameter). Messages display with sender avatars, timestamps, and proper read/unread states.
-   **Activity Tracking**: Comprehensive logging of user actions.
-   **Review System**: 1-5 star ratings with comments for mutual evaluation.
-   **Notifications**: Push notification readiness with device token management.
-   **QR Code System**: Secure QR-based check-in/check-out for assignments. Job management page includes QR code modal with toggle for check-in/check-out codes.
-   **Job Filtering**: Advanced filtering by prefecture, date range, and sorting options.
-   **Worker Onboarding**: "Work Style Guide" page for new workers.
-   **Penalties**: System for tracking worker penalties with a dedicated viewing page.
-   **Support**: Dedicated support page with FAQ and contact information.
-   **Online Workers Display**: Client dashboard shows real-time online worker availability with interactive map visualization using React Leaflet. Map displays worker locations with marker popups showing worker details, auto-centers on worker locations, and handles null-safe rendering for optional profile fields.

## External Dependencies

-   **Database**: Replit PostgreSQL
-   **Payment Gateway**: Stripe Connect (worker payouts implemented; client payment method management requires STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY)
-   **Icons**: Lucide Icons, @heroicons/react
-   **Push Notifications**: Firebase Cloud Messaging
-   **Geolocation**: Browser Geolocation API, OpenStreetMap Nominatim API (geocoding)
-   **Maps**: React Leaflet for interactive map visualization

## Recent Changes
**November 9, 2025**:
- ✅ Enhanced messaging system with deep-linking support (auto-opens conversations from ApplicationsManagePage)
- ✅ Profile image upload functionality already implemented with proper validation
- ✅ Added online workers map visualization with React Leaflet (null-safe rendering, auto-centering)
- ✅ Enhanced ApplicationsManagePage with full worker profile details and contact information
- ✅ Added fee information panel to Job Creation page
- ✅ Added QR code generation modal to Job Management page
- ⏳ Payment method management (Stripe cards) pending - requires Stripe API keys configuration