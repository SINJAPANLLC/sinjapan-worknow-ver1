-- WORK NOW Supabase Schema
-- PostgreSQL 15 / Supabase 2024- compatible

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================
-- USERS
-- =====================================================
create table if not exists public.users (
    id uuid primary key default uuid_generate_v4(),
    email text not null unique,
    password_hash text not null,
    full_name text not null,
    role text not null check (role in ('worker', 'company', 'admin')),
    avatar_url text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- =====================================================
-- JOBS
-- =====================================================
create table if not exists public.jobs (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid not null references public.users (id) on delete cascade,
    title text not null,
    description text not null,
    location text,
    employment_type text,
    hourly_rate integer,
    currency text not null default 'JPY',
    status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
    tags text[] default array[]::text[],
    starts_at timestamptz,
    ends_at timestamptz,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_jobs_company_id on public.jobs (company_id);
create index if not exists idx_jobs_status on public.jobs (status);

-- =====================================================
-- APPLICATIONS
-- =====================================================
create table if not exists public.applications (
    id uuid primary key default uuid_generate_v4(),
    job_id uuid not null references public.jobs (id) on delete cascade,
    worker_id uuid not null references public.users (id) on delete cascade,
    cover_letter text,
    status text not null default 'pending' check (
        status in ('pending', 'interview', 'hired', 'rejected', 'withdrawn')
    ),
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (job_id, worker_id)
);
create index if not exists idx_applications_job_id on public.applications (job_id);
create index if not exists idx_applications_worker_id on public.applications (worker_id);
create index if not exists idx_applications_status on public.applications (status);

-- =====================================================
-- ASSIGNMENTS
-- =====================================================
create table if not exists public.assignments (
    id uuid primary key default uuid_generate_v4(),
    job_id uuid not null references public.jobs (id) on delete cascade,
    worker_id uuid not null references public.users (id) on delete cascade,
    application_id uuid not null references public.applications (id) on delete cascade,
    status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
    started_at timestamptz,
    completed_at timestamptz,
    notes text,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_assignments_job_id on public.assignments (job_id);
create index if not exists idx_assignments_worker_id on public.assignments (worker_id);
create index if not exists idx_assignments_status on public.assignments (status);

-- =====================================================
-- PAYMENTS
-- =====================================================
create table if not exists public.payments (
    id uuid primary key default uuid_generate_v4(),
    assignment_id uuid not null references public.assignments (id) on delete cascade,
    amount integer not null check (amount >= 100),
    currency text not null default 'jpy',
    stripe_payment_intent_id text,
    stripe_transfer_id text,
    status text not null default 'requires_payment_method' check (
        status in (
            'requires_payment_method',
            'requires_confirmation',
            'requires_action',
            'processing',
            'succeeded',
            'canceled'
        )
    ),
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_payments_assignment_id on public.payments (assignment_id);
create index if not exists idx_payments_status on public.payments (status);
create unique index if not exists idx_payments_intent on public.payments (stripe_payment_intent_id) where stripe_payment_intent_id is not null;

-- =====================================================
-- REVIEWS
-- =====================================================
create table if not exists public.reviews (
    id uuid primary key default uuid_generate_v4(),
    assignment_id uuid not null references public.assignments (id) on delete cascade,
    reviewer_id uuid not null references public.users (id) on delete cascade,
    reviewee_id uuid not null references public.users (id) on delete cascade,
    rating integer not null check (rating between 1 and 5),
    comment text,
    is_public boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (assignment_id, reviewer_id)
);
create index if not exists idx_reviews_reviewee_id on public.reviews (reviewee_id);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
create table if not exists public.notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users (id) on delete cascade,
    type text not null check (type in ('application', 'assignment', 'payment', 'system')),
    title text not null,
    body text not null,
    data jsonb default '{}'::jsonb,
    read_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_notifications_user_id on public.notifications (user_id);
create index if not exists idx_notifications_type on public.notifications (type);

-- =====================================================
-- DEVICE TOKENS
-- =====================================================
create table if not exists public.device_tokens (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users (id) on delete cascade,
    token text not null,
    platform text not null,
    created_at timestamptz not null default now(),
    unique (token)
);
create index if not exists idx_device_tokens_user_id on public.device_tokens (user_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
do $$
begin
    if not exists (
        select 1 from pg_proc where proname = 'set_updated_at'
    ) then
        create function public.set_updated_at()
        returns trigger as $$
        begin
            new.updated_at = now();
            return new;
        end;
        $$ language plpgsql;
    end if;
end $$;

do $$
begin
    perform 1 from information_schema.triggers where trigger_name = 'set_updated_at_users';
    if not found then
        create trigger set_updated_at_users
        before update on public.users
        for each row execute function public.set_updated_at();
    end if;

    perform 1 from information_schema.triggers where trigger_name = 'set_updated_at_jobs';
    if not found then
        create trigger set_updated_at_jobs
        before update on public.jobs
        for each row execute function public.set_updated_at();
    end if;

    perform 1 from information_schema.triggers where trigger_name = 'set_updated_at_applications';
    if not found then
        create trigger set_updated_at_applications
        before update on public.applications
        for each row execute function public.set_updated_at();
    end if;

    perform 1 from information_schema.triggers where trigger_name = 'set_updated_at_assignments';
    if not found then
        create trigger set_updated_at_assignments
        before update on public.assignments
        for each row execute function public.set_updated_at();
    end if;

    perform 1 from information_schema.triggers where trigger_name = 'set_updated_at_payments';
    if not found then
        create trigger set_updated_at_payments
        before update on public.payments
        for each row execute function public.set_updated_at();
    end if;

    perform 1 from information_schema.triggers where trigger_name = 'set_updated_at_reviews';
    if not found then
        create trigger set_updated_at_reviews
        before update on public.reviews
        for each row execute function public.set_updated_at();
    end if;

    perform 1 from information_schema.triggers where trigger_name = 'set_updated_at_notifications';
    if not found then
        create trigger set_updated_at_notifications
        before update on public.notifications
        for each row execute function public.set_updated_at();
    end if;
end $$;

-- =====================================================
-- SAMPLE RLS POLICIES (コメントアウト)
-- =====================================================
-- Supabase Auth を利用する際には、以下のような RLS ポリシーを
-- 必要に応じて有効化してください。
--
-- alter table public.users enable row level security;
-- create policy "Users can view self" on public.users
--     using (auth.uid() = id);
--
-- alter table public.jobs enable row level security;
-- create policy "Jobs read" on public.jobs for select using (true);
-- create policy "Company manage jobs" on public.jobs
--     for all using (auth.uid() = company_id);
--
-- それぞれのテーブルで worker/company/admin のロールに合わせた
-- ポリシーを設計してください。

