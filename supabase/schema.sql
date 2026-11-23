-- =====================================================================
--  A Little Universe — Supabase schema
--  Run this once in your project's SQL editor (Dashboard → SQL → New query).
--  Safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------- table
create table if not exists public.experiences (
  id          uuid primary key,
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slug        text not null unique
              check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$'),
  config      jsonb not null
              check (pg_column_size(config) < 1000000),
  published   boolean not null default true,
  unlisted    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists experiences_owner_idx on public.experiences (owner_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists experiences_touch on public.experiences;
create trigger experiences_touch before update on public.experiences
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- RLS
-- Creators can only ever see / change their own rows.
alter table public.experiences enable row level security;

drop policy if exists "owner can read"   on public.experiences;
drop policy if exists "owner can insert" on public.experiences;
drop policy if exists "owner can update" on public.experiences;
drop policy if exists "owner can delete" on public.experiences;

create policy "owner can read"   on public.experiences for select to authenticated using (owner_id = auth.uid());
create policy "owner can insert" on public.experiences for insert to authenticated with check (owner_id = auth.uid());
create policy "owner can update" on public.experiences for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owner can delete" on public.experiences for delete to authenticated using (owner_id = auth.uid());

-- Anonymous visitors get NO direct table access (so nobody can list every
-- published birthday). They can only fetch one experience by its exact slug:
revoke all on public.experiences from anon;

create or replace function public.get_published_experience(p_slug text)
returns table (config jsonb, unlisted boolean)
language sql
stable
security definer
set search_path = public
as $$
  select e.config, e.unlisted
  from public.experiences e
  where e.slug = p_slug and e.published = true
  limit 1;
$$;

revoke all on function public.get_published_experience(text) from public;
grant execute on function public.get_published_experience(text) to anon, authenticated;

-- ---------------------------------------------------------------- storage
-- Public-read bucket (files are served by URL, with unguessable paths),
-- server-enforced size limit and MIME allow-list. No SVG (script risk).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'birthday-media', 'birthday-media', true, 52428800,
  array[
    'image/jpeg','image/png','image/webp','image/gif','image/avif',
    'video/mp4','video/webm','video/quicktime',
    'audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/wave','audio/ogg',
    'audio/aac','audio/mp4','audio/x-m4a','audio/m4a','audio/webm','audio/flac'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Creators may only write inside their own folder:  <user-id>/<experience-id>/<file>
-- (No public SELECT policy: public URLs still work, but nobody can list files.)
drop policy if exists "creator reads own media"   on storage.objects;
drop policy if exists "creator uploads own media" on storage.objects;
drop policy if exists "creator updates own media" on storage.objects;
drop policy if exists "creator deletes own media" on storage.objects;

create policy "creator reads own media" on storage.objects for select to authenticated
  using (bucket_id = 'birthday-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "creator uploads own media" on storage.objects for insert to authenticated
  with check (bucket_id = 'birthday-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "creator updates own media" on storage.objects for update to authenticated
  using (bucket_id = 'birthday-media' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'birthday-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "creator deletes own media" on storage.objects for delete to authenticated
  using (bucket_id = 'birthday-media' and (storage.foldername(name))[1] = auth.uid()::text);
