-- CampAssist Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  phone text,
  role text not null default 'camper' check (role in ('camper', 'assistant', 'admin')),
  festival_id uuid,
  arrival_date date,
  departure_date date,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'camper')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- FESTIVALS
-- ─────────────────────────────────────────
create table public.festivals (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  location text not null,
  start_date date not null,
  end_date date not null,
  map_image_url text,
  map_pois jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.festivals enable row level security;

create policy "Anyone can view festivals"
  on public.festivals for select using (true);

create policy "Admins can manage festivals"
  on public.festivals for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────
-- TENT TYPES
-- ─────────────────────────────────────────
create table public.tent_types (
  id uuid default uuid_generate_v4() primary key,
  festival_id uuid references public.festivals on delete cascade not null,
  name text not null,
  capacity int not null default 2,
  description text not null,
  price_per_day int not null, -- in pence
  damage_deposit int not null, -- in pence
  available_quantity int not null default 10,
  images text[] default '{}',
  created_at timestamptz default now()
);

alter table public.tent_types enable row level security;

create policy "Anyone can view tent types"
  on public.tent_types for select using (true);

create policy "Admins can manage tent types"
  on public.tent_types for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────
-- BOOKINGS
-- ─────────────────────────────────────────
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  camper_id uuid references public.profiles on delete cascade not null,
  tent_type_id uuid references public.tent_types on delete restrict not null,
  festival_id uuid references public.festivals on delete restrict not null,
  arrival_date date not null,
  departure_date date not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'tent_setup', 'tent_collected')),
  assigned_assistant_id uuid references public.profiles,
  notes text,
  created_at timestamptz default now()
);

alter table public.bookings enable row level security;

create policy "Campers can view own bookings"
  on public.bookings for select using (auth.uid() = camper_id);

create policy "Campers can create bookings"
  on public.bookings for insert with check (auth.uid() = camper_id);

create policy "Assistants and admins can view all bookings"
  on public.bookings for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('assistant', 'admin'))
  );

create policy "Assistants and admins can update bookings"
  on public.bookings for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('assistant', 'admin'))
  );

-- ─────────────────────────────────────────
-- ASSISTANCE REQUESTS
-- ─────────────────────────────────────────
create table public.assistance_requests (
  id uuid default uuid_generate_v4() primary key,
  camper_id uuid references public.profiles on delete cascade not null,
  festival_id uuid references public.festivals on delete restrict not null,
  type text not null check (type in ('tent_setup', 'tent_collection', 'general', 'other')),
  description text not null,
  location_description text not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'in_progress', 'complete', 'cancelled')),
  assigned_assistant_id uuid references public.profiles,
  rating int check (rating >= 1 and rating <= 5),
  created_at timestamptz default now()
);

alter table public.assistance_requests enable row level security;

create policy "Campers can view own requests"
  on public.assistance_requests for select using (auth.uid() = camper_id);

create policy "Campers can create requests"
  on public.assistance_requests for insert with check (auth.uid() = camper_id);

create policy "Campers can update own requests (cancel/rate)"
  on public.assistance_requests for update using (auth.uid() = camper_id);

create policy "Assistants and admins can view all requests"
  on public.assistance_requests for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('assistant', 'admin'))
  );

create policy "Assistants can update requests"
  on public.assistance_requests for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'assistant')
  );

create policy "Admins can manage all requests"
  on public.assistance_requests for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────
-- ASSISTANT AVAILABILITY
-- ─────────────────────────────────────────
create table public.assistant_availability (
  assistant_id uuid references public.profiles on delete cascade primary key,
  is_available boolean not null default false,
  festival_id uuid references public.festivals,
  updated_at timestamptz default now()
);

alter table public.assistant_availability enable row level security;

create policy "Assistants can manage own availability"
  on public.assistant_availability for all using (auth.uid() = assistant_id);

create policy "Admins can view all availability"
  on public.assistant_availability for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────
-- SEED DATA (example festival)
-- ─────────────────────────────────────────
insert into public.festivals (name, location, start_date, end_date)
values ('In It Together 2027', 'Margam Park, Wales', '2027-05-23', '2027-05-26');
