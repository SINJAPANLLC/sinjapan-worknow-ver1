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
    -   Primary Color Palette: Turquoise gradient theme (`#00CED1` to `#009999`).
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
    -   Ten core tables: `users`, `jobs`, `applications`, `assignments`, `payments`, `reviews`, `device_tokens`, `bank_accounts`, `withdrawal_requests`, `activity_logs`.
    -   Indexes implemented on all tables for performance.
    -   Extended user profile fields: phone verification, DOB, gender, address, location (latitude/longitude), preferred prefecture, work style, affiliation, ID verification.

### Feature Specifications
-   **Authentication**: Login, registration (worker/client flows), password reset, JWT token management.
-   **Dashboard**: Role-specific dashboards (worker, client, admin) with statistics, quick actions, and activity feeds.
-   **Job Management**: Create, update, delete, list jobs with status management.
-   **Application Management**: Create, update applications with status tracking.
-   **Assignment Management**: Track work assignments from start to completion.
-   **Payment Management**: Full Stripe Connect integration for worker payouts and payment history.
-   **Bank Account Management**: CRUD operations for worker bank accounts (Japanese banking: bank code, branch code, ordinary/current account types).
-   **Withdrawal System**: Worker withdrawal requests with status tracking (pending/processing/completed/rejected), balance calculations (available/pending).
-   **Profile Management**: 
    -   Extended user profiles with personal details (DOB, gender, address)
    -   Phone verification flow (SMS codes in dev mode)
    -   ID document upload
    -   Location features: preferred prefecture selection (47 prefectures), geolocation capture
-   **Activity Tracking**: Comprehensive activity logging system tracking all user actions with metadata, IP addresses, timestamps.
-   **Review System**: 1-5 star ratings with comments for mutual evaluation.
-   **Notifications**: Push notification readiness with device token management.

## External Dependencies

-   **Database**: Replit PostgreSQL
-   **Payment Gateway**: Stripe Connect (fully integrated)
-   **Icons**: Lucide Icons, @heroicons/react
-   **Push Notifications**: Firebase Cloud Messaging (integration ready)
-   **Caching/Queuing**: Redis (planned for caching)
-   **Geolocation**: Browser Geolocation API

## Recent Changes (2025-11-08 - Updated)

### Latest Implementations (11/08 Evening - QR Integration)
1. **QRコード機能の既存ページへの統合** ⭐
   - **WorkerApplicationsPage**:
     - assignmentデータ取得とapplicationとの紐付け（application_id経由）
     - チェックイン/チェックアウトボタン表示（状態に応じて動的表示）
     - assignment詳細情報（開始時刻、完了時刻）の表示
     - QRScanPageへの直接遷移
   - **ClientJobsManagePage**:
     - 求人ごとのassignmentリスト表示（展開可能UI）
     - 各assignmentに「QRコード」ボタン追加
     - QRCodeDisplayPageへの遷移
     - assignment詳細（ワーカーID、ステータス、開始時刻）表示
   - **API拡張**:
     - assignmentsAPI.listにjob_idパラメータ追加（オプション）
   - **ビジネスフロー完成**:
     - ワーカー：応募一覧 → チェックインボタン → QRスキャン → 勤務開始/終了
     - クライアント：求人管理 → assignmentリスト → QRコード表示 → ワーカーがスキャン

### Earlier Implementations (11/08 Afternoon - QR Code Feature)
1. **Secure QR Code Check-in/Check-out System** ⭐
   - **Database**: qr_tokens テーブル作成（時間制限付きトークン管理）
   - **セキュリティ**:
     - 動的トークン生成（secrets.token_urlsafe(32)）
     - 30分有効期限、ワンタイム使用制限
     - assignment_id必須化
     - JSON形式でデータ送信（eval脆弱性を排除）
     - Company所有権チェック（他社のassignmentでQR生成不可）
   - **バックエンド API**:
     - GET `/qr/check-in/{assignment_id}`: チェックインQR生成
     - GET `/qr/check-out/{assignment_id}`: チェックアウトQR生成
     - POST `/qr/check-in`: QRスキャンでチェックイン
     - POST `/qr/check-out`: QRスキャンでチェックアウト
   - **フロントエンド**:
     - QRScanPage (`/qr-scan`): html5-qrcodeでスキャン機能
     - QRCodeDisplayPage (`/qr-code/:assignmentId`): QR表示、有効期限タイマー
   - **ビジネスフロー**:
     - クライアントがassignmentごとにQRコード生成
     - ワーカーがQRスキャンでチェックイン/アウト
     - assignmentsテーブルのstarted_at/completed_atに勤務時間記録

### Earlier Implementations (11/08 Afternoon)
1. **ApplicationsPage Redesign**
   - Replaced old coin icon with premium glassmorphism gradient design
   - Floating animated Zap icon with turquoise gradient (#00CED1 to #009999)
   - Dual CTAs: "おすすめ求人を見る" and "ガイドで準備する"
   - Added contextual tips card with BookOpen icon
   - Empty state aligned with brand design guidelines

2. **Work Style Guide Page** (`/guide/work-style`)
   - Comprehensive onboarding guide for new workers
   - 4-step process flow (応募 → 面接 → 働く → 即時報酬)
   - Benefits section highlighting platform features
   - FAQ accordion with common questions
   - Premium turquoise gradient hero section
   - Framer Motion staggered card animations
   - Integrated with ApplicationsPage and navigation

3. **Job Filtering System Enhancements**
   - **Critical Bug Fix**: Date filter now properly converts all dates to ISO format
   - Previously only "today" worked, now all date selections (9日, 10日, etc.) function correctly
   - Notification preferences hydrated from backend on page load
   - Prefecture + date + sort filters work in combination
   - Distance-based sorting uses haversine formula

4. **Complete Feature Set**
   - Job filters: Prefecture (47 prefectures), Date range, Sort (distance/rate/newest)
   - Favorites: Database-backed, heart icon toggle, persistent across sessions
   - Job notifications: Per-prefecture/date preferences with status sync
   - Geolocation: Automatic distance calculation for job sorting

## Recent Changes (2025-11-08 - Morning)

### Implemented Features
1. **Bank Account Management System**
   - Japanese banking support (bank code, branch code, account types)
   - CRUD operations with default account selection
   - API endpoints: `/bank-accounts/`
   
2. **Withdrawal Request System**
   - Create withdrawal requests linked to bank accounts
   - Balance tracking (available/pending)
   - Status management workflow (pending → processing → completed/rejected)
   - Admin approval interface
   - API endpoints: `/withdrawals/`, `/withdrawals/balance`

3. **Enhanced User Profiles**
   - Personal details: DOB, gender, address, work style, affiliation
   - Phone verification flow (dev mode shows codes in response)
   - ID document upload
   - Location features:
     - Preferred prefecture dropdown (47 Japanese prefectures)
     - Geolocation capture (latitude/longitude)
   - File upload endpoints: `/files/upload/avatar`, `/files/upload/id-document`

4. **Activity Logging System**
   - Comprehensive action tracking
   - Metadata storage for debugging
   - IP address and user-agent capture
   - API endpoints: `/activities/`

5. **Frontend Pages**
   - **PaymentsPage** (`/payments`): Bank accounts, withdrawal requests, transaction history
   - **ProfilePage** (updated): Location fields, phone verification
   - **ActivityPage** (`/activity`): User activity history

### Known Issues & Future Improvements

⚠️ **CRITICAL SECURITY CONCERNS** (Identified by Architecture Review):

1. **Bank Account Number Encryption**
   - **Current**: Account numbers stored and transmitted in plaintext
   - **Required**: Implement encryption/tokenization at rest and in transit
   - **Action**: Add encryption service, mask account numbers in API responses

2. **Withdrawal Race Conditions**
   - **Current**: Balance checks not transactionally protected
   - **Risk**: Concurrent requests can cause overdrafts
   - **Required**: Row-level locking, idempotency keys, transaction isolation

3. **Location Privacy**
   - **Current**: Location data collected without explicit consent tracking
   - **Required**: Add consent UI, obfuscation options, deletion capability
   - **Action**: Implement privacy controls and audit trail

4. **Activity Log Retention**
   - **Current**: Unlimited log accumulation
   - **Risk**: Performance degradation at scale
   - **Required**: Retention policies, partitioning strategy, archival process

5. **Phone Verification**
   - **Current**: In-memory code storage with dev-mode API exposure
   - **Required**: Production SMS integration (Twilio), Redis-based storage, rate limiting

6. **File Upload Security**
   - **Current**: No authentication on upload endpoints, local storage only
   - **Required**: S3 integration, virus scanning, size limits

### Recommended Next Steps
1. Implement encryption layer for sensitive banking data
2. Add database transaction management for withdrawal operations
3. Create privacy consent flows for location data
4. Set up production SMS service (Twil io)
5. Migrate file storage to S3 with CDN
6. Add comprehensive error handling and user feedback
7. Implement automated testing suite
8. Add monitoring and alerting for critical operations