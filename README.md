# WORK VALUE CALCULATOR

Provocative concept app for CORPO. Calculates real vs perceived market value and stores anonymized results in Supabase.

## Stack
- Next.js App Router + TypeScript
- Tailwind + shadcn-style UI components
- Supabase Postgres
- Vercel-ready

## Environment Variables
Create a `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Supabase Tables
Use these schemas (minimal, no PII):

```
create table results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  role_category text,
  industry text,
  residence_tier int,
  exp_band text,
  real_value_usd int,
  perceived_value_usd int,
  gap_usd int,
  gap_pct float,
  label text,
  strengths text[],
  weaknesses text[]
);

create table aggregate_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  role_category text,
  industry text,
  residence_tier int,
  exp_band text,
  age_band text,
  education_level text,
  languages_band text,
  leadership_level text,
  overlap_level text,
  employment_type text,
  ethnicity text,
  real_value_usd int,
  perceived_value_usd int,
  gap_usd int,
  label text
);
```

## Local Development
```
npm install
npm run dev
```

## Vercel Deploy
1. Push the repo to GitHub.
2. Create a new Vercel project.
3. Add environment variables from `.env.local`.
4. Deploy.

## Data
Benchmark datasets live in:
- `data/publicSalaryBenchmarks.json`
- `data/platformRateBenchmarks.json`

Edit or replace them with real data later.
