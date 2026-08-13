import { createClient } from "@supabase/supabase-js";

// Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in
// .env.local. Get both from your Supabase project settings > API.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);

// Suggested tables to create in Supabase (SQL editor):
//
// create table employer_leads (
//   id uuid primary key default gen_random_uuid(),
//   company_name text not null,
//   work_email text not null,
//   employee_estimate int,
//   created_at timestamptz default now()
// );
//
// create table shuttle_positions (
//   id uuid primary key default gen_random_uuid(),
//   shuttle_id text not null,       -- 'shuttle-1' | 'shuttle-2'
//   lat double precision not null,
//   lng double precision not null,
//   updated_at timestamptz default now()
// );
// -- enable Realtime on shuttle_positions so the map updates live
