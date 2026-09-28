-- ─────────────────────────────────────────────────────────────
-- MPIN stored and verified in the database
--
-- The app never sees the PIN hash: the table has RLS enabled with no
-- policies, so the anon key cannot read or write it. The app can only
-- call verify_mpin(), which checks the PIN server side and locks login
-- for a while after repeated wrong attempts.
--
-- Run this in the Supabase SQL editor for BOTH projects (development and
-- production), then set the PIN (as the postgres role, from the SQL editor):
--
--   select public.admin_set_mpin('<4-digit PIN>');
-- ─────────────────────────────────────────────────────────────

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.app_mpin (
  id               smallint primary key default 1 check (id = 1), -- single row
  pin_hash         text        not null,
  failed_attempts  integer     not null default 0,
  locked_until     timestamptz,
  updated_at       timestamptz not null default now()
);

alter table public.app_mpin enable row level security;
revoke all on table public.app_mpin from anon, authenticated;

-- ── Verify (called by the app) ───────────────────────────────
-- Returns: { success, locked, retry_after_seconds, attempts_left }

create or replace function public.verify_mpin(p_pin text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  max_attempts constant integer  := 5;
  lock_period  constant interval := interval '5 minutes';
  rec public.app_mpin%rowtype;
begin
  select * into rec from public.app_mpin where id = 1 for update;

  if not found then
    raise exception 'MPIN is not configured';
  end if;

  if rec.locked_until is not null and rec.locked_until > now() then
    return jsonb_build_object(
      'success', false,
      'locked', true,
      'retry_after_seconds', ceil(extract(epoch from rec.locked_until - now()))::int,
      'attempts_left', 0
    );
  end if;

  if p_pin ~ '^\d{4}$' and crypt(p_pin, rec.pin_hash) = rec.pin_hash then
    update public.app_mpin
       set failed_attempts = 0, locked_until = null
     where id = 1;

    return jsonb_build_object('success', true, 'locked', false);
  end if;

  rec.failed_attempts := rec.failed_attempts + 1;

  if rec.failed_attempts >= max_attempts then
    update public.app_mpin
       set failed_attempts = 0, locked_until = now() + lock_period
     where id = 1;

    return jsonb_build_object(
      'success', false,
      'locked', true,
      'retry_after_seconds', extract(epoch from lock_period)::int,
      'attempts_left', 0
    );
  end if;

  update public.app_mpin
     set failed_attempts = rec.failed_attempts, locked_until = null
   where id = 1;

  return jsonb_build_object(
    'success', false,
    'locked', false,
    'attempts_left', max_attempts - rec.failed_attempts
  );
end;
$$;

revoke all on function public.verify_mpin(text) from public;
grant execute on function public.verify_mpin(text) to anon, authenticated;

-- ── Set / reset (SQL editor only, never callable from the app) ──

create or replace function public.admin_set_mpin(p_new_pin text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if p_new_pin !~ '^\d{4}$' then
    raise exception 'MPIN must be exactly 4 digits';
  end if;

  insert into public.app_mpin (id, pin_hash, failed_attempts, locked_until, updated_at)
  values (1, crypt(p_new_pin, gen_salt('bf')), 0, null, now())
  on conflict (id) do update
    set pin_hash = excluded.pin_hash,
        failed_attempts = 0,
        locked_until = null,
        updated_at = now();
end;
$$;

revoke all on function public.admin_set_mpin(text) from public, anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- Bill number is mandatory for new invoices and invoice edits
--
-- A trigger (not a CHECK constraint) so that older rows saved with an empty
-- bill no (stored as 0/null) can still be marked paid or deleted: it only
-- runs when bill_no itself is inserted or updated.
-- ─────────────────────────────────────────────────────────────

create or replace function public.enforce_invoice_bill_no()
returns trigger
language plpgsql
as $$
begin
  if new.bill_no is null or new.bill_no <= 0 then
    raise exception 'Bill number is required'
      using errcode = '23514'; -- check_violation
  end if;
  return new;
end;
$$;

drop trigger if exists invoice_bill_no_required on public.invoice;

create trigger invoice_bill_no_required
  before insert or update of bill_no on public.invoice
  for each row execute function public.enforce_invoice_bill_no();
