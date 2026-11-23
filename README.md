# Palawan Wildlife App

Public webpage + mobile-first field guide for Palawan's endemic wildlife. Built with **Next.js**, **TypeScript**, and **Tailwind CSS**. Species data lives in local JSON — no database required.

Photo identification for **animals and plants** uses **Palawan Wildlife AI**.

## Setup

```bash
npm install
cp .env.example .env.local
```

Add your key to `.env.local`:

```bash
OPENAI_API_KEY=sk-...
```

Developer setup: Palawan Wildlife AI uses an API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm start       # serve production build
```

## Android APK

The APK is a Capacitor shell that loads the Next.js app over your network (photo ID needs the API).

**APK location**

```
releases/palawan-wildlife-debug.apk
```

Also built at: `android/app/build/outputs/apk/debug/app-debug.apk`

**Install on phone**

1. On your Mac (same Wi‑Fi as the phone):

```bash
npm run dev:mobile
```

2. Transfer `releases/palawan-wildlife-debug.apk` to the phone and install (allow unknown sources).

3. Open **Palawan Wildlife**. It loads `http://192.168.86.44:3000` by default — update that IP in `capacitor.config.ts` if your Mac’s address changed, then rebuild:

```bash
npm run apk:debug
```

**Production URL** (hosted Next app):

```bash
CAPACITOR_SERVER_URL=https://your-deployed-app.example.com npm run apk:debug
```

Requires JDK 21 for the Gradle build (`/opt/homebrew/opt/openjdk@21`).

## Pages

| Route | Purpose |
|---|---|
| `/` | Home — hero, mission, featured species, CTA |
| `/species` | Searchable / filterable species explorer |
| `/species/[slug]` | Species detail |
| `/identify` | **Photo ID** (Palawan Wildlife AI) + manual field filters |
| `/map` | Recent sightings + map placeholder |
| `/conservation` | Threats, work, how to help |
| `/report` | **Phase 2** — sighting reports (coming soon) |
| `/admin` | Admin dashboard (admin demo login only) |
| `/login` | Admin or community (students / anyone) demo login |
| `/partner` | Community dashboard — reports & yearly points |
| `/about` | Partners + rescue hotline |

API: `POST /api/identify` — multipart form field `image` → JSON identification result.

Desktop uses the top header; phones also get a bottom tab bar (Home, Identify, Map, Report, About).

## Add a species

1. Open `data/species.json`.
2. Copy an existing entry and fill in:

```json
{
  "id": "9",
  "slug": "your-slug",
  "name": "Common Name",
  "localName": "Local Name",
  "scientificName": "Genus species",
  "category": "Mammals",
  "status": "Endangered",
  "image": "https://…",
  "description": "…",
  "habitat": "…",
  "diet": "…",
  "threats": ["…"],
  "facts": ["…"],
  "size": "medium",
  "colors": ["brown"],
  "habitats": ["forest"]
}
```

3. Save — the explorer, identify guide, and detail pages pick it up automatically. Photo ID can also match `matchedSlug` to catalogue entries.

Allowed `category`: Mammals, Birds, Reptiles, Plants (land only — no Marine).  
Allowed `status`: Critically Endangered, Endangered, Vulnerable, Near Threatened, Least Concern.  
`size` / `colors` / `habitats` power the Identify filters (see `lib/types.ts`). Habitats are land-focused: forest, mangrove, coastal, grassland.

## Project structure

```
app/           # Routes (App Router) + api/identify
components/    # Shared UI (incl. PhotoIdentifier)
data/          # species.json, sightings.json
lib/           # Types + helpers (incl. identify.ts)
public/        # Static assets
```

## What's next

- Connect `/report` to a real API or database
- Replace the map placeholder with Leaflet + OpenStreetMap
- Add an `/admin` review queue for sightings
- PWA caching for offline field use
- EN / Tagalog language toggle
- Swap the placeholder rescue hotline in About / Footer

## License

Educational starter project. Wildlife photos via Unsplash — replace with rights-cleared images for production. AI IDs are suggestions, not definitive taxonomy.
