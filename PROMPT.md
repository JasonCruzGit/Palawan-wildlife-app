# Prompt: Build a Palawan Wildlife App

> Copy-paste the **Master Prompt** below into Cursor / Claude / ChatGPT.
> Use the Short Prompt if you need a one-shot quick build.

---

## Master Prompt (Recommended)

```
You are a senior full-stack developer. Build a complete, production-ready
"Palawan Wildlife App" — with a public webpage and a mobile-first page —
in this empty project. Write concise, clean, well-organized code. No bloat.

CONTEXT
Palawan, Philippines is a UNESCO Biosphere Reserve with endemic species found
nowhere else: Philippine Pangolin (Balintong), Palawan Peacock-Pheasant,
Palawan Hornbill, Palawan Bearcat, and endemic plants — land species only
(no marine wildlife). The app educates the public, helps identify species,
and lets people report sightings to support conservation (e.g. Katala
Foundation / local wildlife rescue).

TECH STACK
- Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- One codebase, responsive: desktop = public webpage, mobile = mobile page
- Local JSON data file for species (no database, no backend yet)
- Next/Image, semantic HTML, accessible (ARIA labels, alt text)

1. PUBLIC WEBPAGE (Desktop + Mobile)
- `/` Home: hero with Palawan wildlife photo, mission, featured endangered
  species carousel, conservation stats, call-to-action (Report a Sighting)
- `/species` Explorer: searchable + filterable grid (category: Mammals,
  Birds, Reptiles, Plants; status: Endangered / Vulnerable / Least Concern)
- `/species/[slug]` Detail: photo, scientific name, local name, description,
  habitat, diet, threats, conservation status, fun facts
- `/map` Sightings Map: list + simple map placeholder showing recent sightings
- `/conservation` : threats, what we do, rescue & release, how to help
- `/report` Report a Sighting form: species, photo upload, GPS/location,
  date, notes, reporter contact — validate and show success state
- `/about` About, partners, emergency wildlife rescue hotline
- Header, footer, mobile bottom nav. Fast, SEO-friendly (metadata per page).

2. MOBILE PAGE (Mobile-first, installable feel)
- Bottom tab bar: Home, Identify, Map, Report, Profile
- `/identify` Field Guide: quick ID by size / color / habitat, offline-friendly
  species cards, large tap targets, works one-handed
- Big "Report Sighting" button, camera/photo upload, auto GPS if permitted
- Optimized for low-end phones & slow connections: lazy-load images, small bundle

DATA — create `data/species.json` with at least 8 real Palawan land species
and plants: Philippine Pangolin, Palawan Peacock-Pheasant, Palawan Hornbill,
Palawan Bearcat (Binturong), Palawan Frogmouth, Blue-naped Parrot, Narra,
Bakawan. Each: id, slug, name, localName, scientificName, category,
status, image, description, habitat, threats, facts[]. Exclude marine taxa.

DESIGN
- Nature palette: deep forest green, sand, ocean teal; clean, modern, friendly
- Rounded cards, clear typography, dark text on light background
- Fully responsive, accessible, consistent spacing. No purple/blue gradients.

CODE QUALITY (IMPORTANT)
- Concise & clean: small reusable components in `components/`, data separate
  from UI, no duplicated code, no unused deps, no placeholder lorem ipsum
- TypeScript types for all data, Server Components by default, 'use client'
  only where needed, commented only where logic is non-obvious
- Folder structure: app/ (routes), components/, data/, lib/, public/images/
- Finish with: setup instructions, how to add a species, and what to build next

Build it now. Start with project setup, then data, components, and pages.
Ask nothing — make sensible defaults and ship a working app.
```

---

## Short Prompt (Quick Build)

```
Build a Palawan Wildlife App in Next.js + TypeScript + Tailwind: one responsive
codebase with (1) a public webpage — Home, Species Explorer with search/filters,
Species Detail, Sightings Map, Conservation, Report a Sighting form, About —
and (2) a mobile-first field guide with bottom tab bar, quick species ID,
camera + GPS sighting report, offline-friendly cards. Use a local
`data/species.json` with 8+ real endemic land species and plants (Philippine
Pangolin, Palawan Peacock-Pheasant, Palawan Hornbill, Narra, etc.) including
status, habitat, and threats. Nature colors (forest green / sand / teal), accessible,
SEO-ready. Keep code concise and clean: reusable components, separate data,
no bloat, no duplicated code. Ship a working app with setup instructions.
```

---

## Optional Add-ons (append to the prompt if needed)

| Need | Append this line |
|---|---|
| Tagalog language | `Add EN/TL language toggle; translate UI and species local names.` |
| Real map | `Use Leaflet + OpenStreetMap for the sightings map (no API key).` |
| Admin / KFI staff | `Add a simple /admin page to review and verify reported sightings.` |
| Offline mobile | `Make it a PWA: installable, caches species data for offline field use.` |
| Donations | `Add a Donate section with GCash / bank / PayPal placeholders.` |
