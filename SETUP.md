# CampAssist — Setup Guide

## Step 1: Install Dependencies

```bash
cd campAssist
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the full contents of `supabase/schema.sql`
3. Copy your project URL and anon key from Settings → API

## Step 3: Set Up Pusher

1. Go to [pusher.com](https://pusher.com) and create a new Channels app
2. Choose the EU cluster
3. Copy your App ID, Key, and Secret

## Step 4: Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_PUSHER_APP_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=eu
PUSHER_APP_ID=your-app-id
PUSHER_SECRET=your-secret

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STAFF_CODE=CAMP2025
```

> Change `NEXT_PUBLIC_STAFF_CODE` to anything you want. Give this code to your assistants when they sign up.

## Step 5: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 6: Deploy to Vercel

1. Push the `campAssist` folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Add all environment variables in Vercel's dashboard
4. Deploy

## Step 7: Set Up Your First Festival

1. Log into Supabase → Table Editor → `festivals`
2. Edit the seeded "In It Together 2027" record with the correct details
3. Add tent types via the `tent_types` table for your festival
4. Log in as admin (set your role to 'admin' in the `profiles` table) to manage map pins

## Creating an Admin Account

1. Sign up normally via the app
2. In Supabase → Table Editor → `profiles`, find your record
3. Change the `role` column from `camper` to `admin`
4. Log out and log back in — you'll be redirected to /admin

## Key URLs

| Path | Who uses it |
|------|-------------|
| `/` | Landing page |
| `/signup` | Camper registration |
| `/login` | All users |
| `/assistant-signup` | Staff registration (needs code) |
| `/dashboard` | Camper home |
| `/tents` | Browse tents |
| `/map` | Festival map |
| `/request-help` | Submit assistance request |
| `/assistant-dashboard` | Assistant home |
| `/admin` | Admin panel |

## Adding Festival Map Images

1. Upload a JPG/PNG of the festival site plan to Supabase Storage
2. Copy the public URL
3. In Supabase → `festivals` table, paste the URL into `map_image_url`
4. In the Admin panel → Map tab, add pins with X/Y coordinates (0-1000 grid)

The map uses Leaflet with a `CRS.Simple` (flat) coordinate system.
Coordinates are on a 0–1000 × 0–1000 grid overlaid on your image.
Place pins by estimating where features fall on that grid.
