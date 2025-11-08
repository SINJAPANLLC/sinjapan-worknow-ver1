-- WORK NOW Supabase RLS Policies (サンプル)
-- 必要に応じて UUID / auth.uid() の整合性を確認してください。

alter table public.users enable row level security;
create policy "Users select self" on public.users
    for select using (auth.uid() = id);
create policy "Users update self" on public.users
    for update using (auth.uid() = id);

alter table public.jobs enable row level security;
create policy "Jobs public read" on public.jobs
    for select using (true);
create policy "Jobs manage by owner" on public.jobs
    using (auth.uid() = company_id)
    with check (auth.uid() = company_id);

alter table public.applications enable row level security;
create policy "Applications view related"
    on public.applications for select using (
        auth.uid() = worker_id
        or auth.uid() in (
            select company_id from public.jobs j where j.id = job_id
        )
    );
create policy "Applications create by worker"
    on public.applications for insert with check (auth.uid() = worker_id);
create policy "Applications update by company"
    on public.applications for update using (
        auth.uid() in (
            select company_id from public.jobs j where j.id = job_id
        )
    );

alter table public.assignments enable row level security;
create policy "Assignments view related"
    on public.assignments for select using (
        auth.uid() = worker_id
        or auth.uid() in (
            select company_id from public.jobs j where j.id = job_id
        )
    );
create policy "Assignments create by company"
    on public.assignments for insert with check (
        auth.uid() in (
            select company_id from public.jobs j where j.id = job_id
        )
    );

alter table public.payments enable row level security;
create policy "Payments view related"
    on public.payments for select using (
        auth.uid() in (
            select worker_id from public.assignments a where a.id = assignment_id
        )
        or auth.uid() in (
            select company_id from public.jobs j
            join public.assignments a on a.job_id = j.id
            where a.id = assignment_id
        )
    );
create policy "Payments manage admin" on public.payments
    using (auth.role() = 'service_role');

alter table public.reviews enable row level security;
create policy "Reviews view public"
    on public.reviews for select using (is_public or reviewer_id = auth.uid() or reviewee_id = auth.uid());
create policy "Reviews insert reviewer"
    on public.reviews for insert with check (auth.uid() = reviewer_id);
create policy "Reviews update reviewer"
    on public.reviews for update using (auth.uid() = reviewer_id);

alter table public.notifications enable row level security;
create policy "Notifications view own"
    on public.notifications for select using (auth.uid() = user_id);
create policy "Notifications insert service"
    on public.notifications for insert using (auth.role() = 'service_role');

alter table public.device_tokens enable row level security;
create policy "Device tokens own"
    on public.device_tokens
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- 管理者権限 (admin role) 用に、必要なら service_role や
-- 追加のカスタムロールを作成してフルアクセスを付与してください。
