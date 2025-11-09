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

### November 8, 2025 - Automatic Payment System & Profile Enhancements
-   **Automatic Payment Creation**: Implemented automatic payment creation when assignments are completed. System calculates hourly_rate × hours_worked and creates internal payment records with status='succeeded'.
-   **Payment Flow**: QR check-out and assignment status update (to 'completed' or 'delivered') both trigger automatic payment creation via `_auto_create_payment_if_needed()` method.
-   **Payment Service**: Added `create_internal_payment()` method for Stripe-free internal payments. All payments now tracked in database with proper assignment linking.
-   **Balance Integration**: Worker balance (出金可能残高) automatically reflects completed assignment payments. WithdrawalService calculates: SUM(succeeded payments) - SUM(completed/processing withdrawals).
-   **Emergency Contact Fields**: Added emergency_contact_name, emergency_contact_phone, emergency_contact_relationship to users table and ProfilePage.
-   **Qualifications System**: Added qualifications (text array) to users table for storing worker certifications.
-   **Penalty System**: Created penalties table with types (warning/suspension/ban), penalty points, expiration dates. Built PenaltiesPage for workers to view their penalty history.
-   **Password Change API**: Implemented PUT /auth/password/change endpoint for secure password updates with current password verification.
-   **Support Page**: Created SupportPage with FAQ section, contact methods (email/phone), and chat support placeholder.
-   **Profile Improvements**: Extended ProfilePage to include emergency contact forms, qualifications management, and password change functionality.

### November 8, 2025 - Wolt-Style Delivery Management System
-   **Delivery Status Flow**: Implemented 4-stage delivery progression (pending_pickup → picking_up → in_delivery → delivered) with automatic timestamp tracking for picked_up_at and delivered_at.
-   **Database Schema**: Extended assignments table with pickup/delivery location fields (pickup_location, delivery_location) and coordinates (pickup_lat, pickup_lng, delivery_lat, delivery_lng).
-   **Backend APIs**: Added `GET /assignments/active/delivery` endpoint to fetch worker's current delivery, and `POST /assignments/{id}/advance-status` for status progression.
-   **Interactive Delivery Card**: Worker dashboard displays active delivery card with current status, pickup/delivery locations, and one-tap action button to advance status.
-   **Route Visualization**: Integrated Leaflet Routing Machine to display turn-by-turn delivery route on map from pickup location to delivery destination with turquoise (#00CED1) route line.
-   **Custom Map Markers**: Apple Maps-style markers for pickup (orange) and delivery (turquoise) locations with distinct styling.
-   **Real-time Updates**: Delivery status auto-refreshes every 5 seconds, ensuring workers see latest assignment state.
-   **Status-Based Actions**: Dynamic button labels ("商品受取に向かう", "商品を受け取った", "配達完了") guide workers through each delivery stage.

### November 9, 2025 - Prefecture & Sort Selection Dropdowns
-   **Prefecture Selection**: Implemented fully functional 47-prefecture dropdown menu with 2-column grid layout, Framer Motion animations, and instant filtering on selection.
-   **Sort Selection**: Added interactive sort dropdown (現在地から近い順/時給が高い順/新着順) with smooth animations and real-time query updates.
-   **UI Enhancements**: Chevron rotation on dropdown open/close, gradient highlighting for selected options, backdrop blur effects on menus.
-   **Icon Update**: Changed BottomNav message icon from Bell (notifications) to MessageCircle for consistency with `/messages` route.
-   **State Management**: Dropdown open/close states managed separately, menus close automatically on selection for better UX.

### November 9, 2025 - Application Cards UX Improvements
-   **Job Information Display**: Extended ApplicationRead schema with JobSummary (title, company_name, company_id) to show human-readable job details instead of technical IDs.
-   **Backend Enhancement**: ApplicationService now enriches application responses with job metadata by fetching job and company information. Implemented efficient batch lookup to minimize database queries.
-   **Frontend Type Updates**: Added JobSummary interface to frontend Application type to support job title and company name display.
-   **ApplicationsPage Redesign**: Application cards now display job title and company name prominently, removing confusing technical job IDs.
-   **Smart Tab Filtering**: Completed assignments (status='completed' or with completed_at timestamp) now automatically appear in "これまでの仕事" tab, while active/pending work stays in "今後の予定" tab.
-   **Graceful Fallbacks**: UI handles missing job information gracefully with sensible defaults.

### November 9, 2025 - Routing Fixes & Payment Validation
-   **Routing Improvements**: Added missing routes for `/penalties`, `/support`, and `/reviews` in App.tsx. All three pages now accessible via ProtectedRoute with proper imports for PenaltiesPage and SupportPage.
-   **Withdrawal Validation Fix**: Updated PaymentsPage withdrawal request form to enforce 100円 minimum (matching backend validation). Changed input min attribute from "1" to "100" and updated validation message.
-   **File Upload Verification**: Confirmed avatar and ID document upload functionality is correctly implemented. Backend endpoints (`/files/upload/avatar`, `/files/upload/id-document`) return updated user object, and frontend properly updates auth state via setUser.
-   **Balance Display Verification**: Confirmed ProfilePage correctly displays withdrawal balance using TanStack Query with auto-refresh. Balance calculation verified in WithdrawalService (SUM of succeeded payments minus completed/processing withdrawals).
-   **System Health**: All workflows running without errors. Backend serving static files from `/uploads` directory. Frontend properly configured on port 5000 with CORS enabled.

### November 8, 2025 - Urgent Jobs & Geocoding Implementation
-   **Urgent Jobs System**: Added `is_urgent` and `urgent_deadline` flags to jobs table. Urgent jobs are now prioritized in all job listings (ORDER BY is_urgent DESC).
-   **Automatic Geocoding**: Integrated OpenStreetMap Nominatim API for address-to-coordinates conversion. Jobs with `location` field are automatically geocoded on creation to populate `latitude` and `longitude` for map display.
-   **Job Card Navigation**: Worker dashboard job cards are now clickable and navigate to `/jobs/{id}` detail page with hover/active animations.
-   **Online Workers Display**: Client dashboard now shows real-time list of online workers with auto-refresh every 30 seconds. Companies can see worker availability instantly.
-   **Backend Enhancements**: Added `GET /auth/workers/online` endpoint for companies/admins. Updated job service to handle async geocoding.
-   **UI Improvements**: Removed demand indicator, fixed mobile text overflow, added turquoise gradient styling (#00CED1 to #009999) for online worker cards.