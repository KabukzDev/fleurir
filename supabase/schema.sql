create extension if not exists pgcrypto;

create table if not exists public.profiles (
  username text primary key,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  image text not null default '/testing/anna_test.png',
  name text not null,
  email text not null unique,
  role text not null default 'member',
  bio text not null default '',
  location text not null default '',
  points integer not null default 0,
  joined_at date not null default current_date,
  interests text[] not null default '{}',
  is_online boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.communities (
  slug text primary key,
  symbol text not null,
  name text not null,
  banner text not null,
  manager_username text not null references public.profiles(username),
  profile_points integer not null default 0,
  profile_contributions integer not null default 0,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  community_slug text not null references public.communities(slug) on delete cascade,
  title text not null,
  type text not null check (type in ('question', 'discussion')),
  content text not null,
  author_username text not null references public.profiles(username),
  upvotes integer not null default 0,
  solved boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  post_id uuid not null references public.posts(id) on delete cascade,
  author_username text not null references public.profiles(username),
  content text not null,
  upvotes integer not null default 0,
  accepted boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.comment_replies (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  comment_id uuid not null references public.comments(id) on delete cascade,
  author_username text not null references public.profiles(username),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.leagues (
  id text primary key,
  tier text not null,
  name text not null,
  threshold text not null,
  accent text not null,
  banner text not null,
  sort_order integer not null default 0
);

create table if not exists public.league_entries (
  id uuid primary key default gen_random_uuid(),
  league_id text not null references public.leagues(id) on delete cascade,
  username text not null references public.profiles(username),
  display_name text not null,
  score integer not null default 0,
  collaborations integer not null default 0,
  unique (league_id, username)
);

alter table public.profiles enable row level security;
alter table public.communities enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.comment_replies enable row level security;
alter table public.leagues enable row level security;
alter table public.league_entries enable row level security;

drop policy if exists "Profiles are public" on public.profiles;
create policy "Profiles are public"
on public.profiles for select
using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

drop policy if exists "Communities are public" on public.communities;
create policy "Communities are public"
on public.communities for select
using (true);

drop policy if exists "Posts are public" on public.posts;
create policy "Posts are public"
on public.posts for select
using (true);

drop policy if exists "Authenticated users can create posts" on public.posts;
create policy "Authenticated users can create posts"
on public.posts for insert
to authenticated
with check (auth.uid() = (select auth_user_id from public.profiles where username = author_username));

drop policy if exists "Comments are public" on public.comments;
create policy "Comments are public"
on public.comments for select
using (true);

drop policy if exists "Authenticated users can create comments" on public.comments;
create policy "Authenticated users can create comments"
on public.comments for insert
to authenticated
with check (auth.uid() = (select auth_user_id from public.profiles where username = author_username));

drop policy if exists "Replies are public" on public.comment_replies;
create policy "Replies are public"
on public.comment_replies for select
using (true);

drop policy if exists "Authenticated users can create replies" on public.comment_replies;
create policy "Authenticated users can create replies"
on public.comment_replies for insert
to authenticated
with check (auth.uid() = (select auth_user_id from public.profiles where username = author_username));

drop policy if exists "Leagues are public" on public.leagues;
create policy "Leagues are public"
on public.leagues for select
using (true);

drop policy if exists "League entries are public" on public.league_entries;
create policy "League entries are public"
on public.league_entries for select
using (true);
