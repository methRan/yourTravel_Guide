-- Run once in the Supabase SQL editor or through `supabase db push`.
create extension if not exists pgcrypto;
create table public.owners (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.owners enable row level security;
-- No browser policies: ownership can only be assigned by a trusted database administrator.
create or replace function public.is_owner() returns boolean language sql stable security definer set search_path = '' as $$
 select exists (select 1 from public.owners where user_id = auth.uid());
$$;
revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;

create table public.bookings (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 customer_name text not null check (length(customer_name) between 1 and 100),
 email text not null check (length(email) between 3 and 254),
 phone text not null check (length(phone) between 8 and 25),
 selection text not null check (length(selection) between 1 and 150),
 guide_id text check (guide_id in ('sunil','nimal','dilani','kasun')),
 tour_id text check (tour_id in ('highlights','discover','complete')),
 start_date date not null, end_date date not null check(end_date >= start_date),
 group_size integer not null check(group_size between 1 and 30),
 pickup text not null check(length(pickup) between 1 and 200),
 requirements text not null default '' check(length(requirements) <= 3000),
 status text not null default 'Pending' check(status in ('Pending','Accepted','Declined','Completed')),
 created_at timestamptz not null default now(),
 check (num_nonnulls(guide_id,tour_id) = 1)
);
create index bookings_user_idx on public.bookings(user_id);
alter table public.bookings enable row level security;
create policy "Customers read their own bookings; owners read all" on public.bookings for select to authenticated using(user_id=auth.uid() or public.is_owner());
create policy "Customers submit pending requests only" on public.bookings for insert to authenticated with check(user_id=auth.uid() and status='Pending' and start_date>=current_date);
create policy "Owners update bookings" on public.bookings for update to authenticated using(public.is_owner()) with check(public.is_owner());
-- Owner API receives update permission for status only, not customer identity or request details.
grant select, insert on public.bookings to authenticated;
revoke update on public.bookings from authenticated;
grant update(status) on public.bookings to authenticated;

create table public.reviews (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 booking_id uuid not null unique references public.bookings(id) on delete cascade,
 guide_id text not null check(guide_id in ('sunil','nimal','dilani','kasun')),
 customer_name text not null check(length(customer_name) between 1 and 100),
 country text not null check(length(country) between 1 and 100),
 rating integer not null check(rating between 1 and 5),
 body text not null check(length(body) between 20 and 3000),
 photos text[] not null default '{}' check(cardinality(photos)<=5),
 status text not null default 'Pending' check(status in ('Pending','Approved','Rejected')),
 created_at timestamptz not null default now()
);
create index reviews_guide_idx on public.reviews(guide_id,status);
alter table public.reviews enable row level security;
-- Review rows contain no email/phone; only names/country which customers consent to publish.
create policy "Public approved reviews" on public.reviews for select to anon, authenticated using(status='Approved');
create policy "Customers read their reviews; owner moderation" on public.reviews for select to authenticated using(user_id=auth.uid() or public.is_owner());
create or replace function public.valid_review_photos(paths text[], review_id uuid) returns boolean language sql stable set search_path = '' as $$
 select not exists(select 1 from unnest(paths) path where path not like auth.uid()::text || '/' || review_id::text || '/%');
$$;
create policy "Completed customers submit pending reviews" on public.reviews for insert to authenticated with check(
 user_id=auth.uid() and status='Pending' and public.valid_review_photos(photos,id) and
 exists(select 1 from public.bookings b where b.id=booking_id and b.user_id=auth.uid() and b.status='Completed' and (b.guide_id is null or b.guide_id=reviews.guide_id))
);
create policy "Owners moderate reviews" on public.reviews for update to authenticated using(public.is_owner()) with check(public.is_owner());
grant select on public.reviews to anon, authenticated;
grant insert on public.reviews to authenticated;
revoke update on public.reviews from authenticated;
grant update(status) on public.reviews to authenticated;

create table public.enquiries (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(name) between 1 and 100),
 email text not null check(length(email) between 3 and 254),
 country text not null check(length(country) between 1 and 100),
 phone text not null default '' check(length(phone)<=25),
 travel_date date not null,
 travellers integer not null check(travellers between 1 and 30),
 package_id text not null default '' check(package_id in ('','highlights','discover','complete')),
 message text not null check(length(message) between 10 and 3000),
 created_at timestamptz not null default now()
);
alter table public.enquiries enable row level security;
create policy "Visitors submit enquiries" on public.enquiries for insert to anon, authenticated with check(travel_date>=current_date);
create policy "Only owners read enquiries" on public.enquiries for select to authenticated using(public.is_owner());
grant insert on public.enquiries to anon, authenticated;
grant select on public.enquiries to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values ('review-photos','review-photos',false,5242880,array['image/jpeg','image/png','image/webp']);
create policy "Customers upload photos to their own folder" on storage.objects for insert to authenticated with check(bucket_id='review-photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Customers remove their own photos" on storage.objects for delete to authenticated using(bucket_id='review-photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Approved review photos are viewable" on storage.objects for select to anon, authenticated using(bucket_id='review-photos' and exists(select 1 from public.reviews r where r.status='Approved' and name=any(r.photos)));
create policy "Customer and owner private photo access" on storage.objects for select to authenticated using(bucket_id='review-photos' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_owner()));
