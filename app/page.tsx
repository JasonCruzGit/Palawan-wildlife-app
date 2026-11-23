import Image from "next/image";
import Link from "next/link";
import HeroBackgroundSlider from "@/components/HeroBackgroundSlider";
import StatusBadge from "@/components/StatusBadge";
import { getFeaturedSpecies, sightings, species } from "@/lib/species";

const habitats = [
  {
    name: "Forest",
    body: "Lowland and limestone forests hold pangolins, peacock-pheasants, leopard cats, and hornbills — many of them found only in the Palawan faunal region.",
    image: "/images/species/palawan-hornbill.jpg",
    alt: "Palawan hornbill on a forest log",
  },
  {
    name: "Coast & nearshore waters",
    body: "Mangroves, nesting beaches, and reefs link land to sea — pawikan (green and hawksbill turtles), crocodiles, and shore forest share this edge.",
    image: "/images/species/hawksbill-sea-turtle.jpg",
    alt: "Hawksbill sea turtle in coastal waters",
  },
  {
    name: "Forest floor & trails",
    body: "Camera traps catch bearded pigs, mongoose, monitors, and leopard cats moving along leaf litter and stream edges after dark.",
    image: "/images/species/palawan-leopard-cat.jpg",
    alt: "Palawan leopard cat at a forest tree hollow",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Identify",
    body: "Upload a photo or use field filters to narrow what you saw — animal or plant.",
    href: "/identify",
    cta: "Open identify",
  },
  {
    step: "02",
    title: "Learn",
    body: "Open the catalogue entry for status, habitat, threats, and local names.",
    href: "/species",
    cta: "Browse guide",
  },
  {
    step: "03",
    title: "Map",
    body: "See where verified field notes cluster across the island.",
    href: "/map",
    cta: "View map",
  },
];

const fieldTips = [
  "Keep distance — never chase, feed, or handle wild animals.",
  "Do not buy wild-caught pets, scales, or “souvenir” wildlife products.",
  "Stay on trails — leave dens, nests, and diggings undisturbed.",
  "Injured or trafficked wildlife: contact rescue partners, not social media first.",
];

export default function HomePage() {
  const featured = getFeaturedSpecies().slice(0, 3);
  const animals = species.filter((s) => s.category !== "Plants").length;
  const plants = species.filter((s) => s.category === "Plants").length;
  const atRisk = species.filter((s) =>
    ["Critically Endangered", "Endangered", "Vulnerable"].includes(s.status)
  ).length;

  return (
    <>
      <section className="hero-screen relative isolate overflow-hidden bg-ink">
        <HeroBackgroundSlider />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />

        <div className="relative z-[1] mx-auto flex h-full min-h-[inherit] max-w-6xl flex-col justify-end px-4 pb-40 pt-24 sm:pt-28 md:pb-20">
          <p className="animate-rise font-display text-[clamp(3.2rem,12vw,7.5rem)] font-bold leading-[0.9] tracking-tight text-white">
            Palawan
            <br />
            <span className="text-[#e04e1a]">Wildlife</span>
          </p>
          <div className="rule-in mt-6 h-px w-24 bg-signal" />
          <p className="animate-rise-delay mt-5 max-w-md text-base leading-relaxed text-white sm:text-lg sm:text-white/90">
            Endemic species. Field notes. Sightings that reach the people who can act.
          </p>
          <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-4">
            <Link
              href="/identify"
              className="bg-signal px-6 py-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-paper hover:bg-signal-dark"
            >
              Identify
            </Link>
            <Link
              href="/species"
              className="border border-paper/40 px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-paper hover:border-paper"
            >
              Open the guide
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          Why this exists
        </p>
        <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
          Palawan holds animals and plants found nowhere else — and they are running out of
          room.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
          The island is a separate evolutionary pocket from the rest of the Philippines. Forests,
          mangroves, and karst edges still hold endemic life, but trade, clearing, and shoreline
          build-out shrink that ground every year.
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
          This public desk helps you name what you see, understand the threat status, and connect
          with partners such as Katala Foundation Inc. who work rescue, education, and habitat
          protection on the ground.
        </p>

        <dl className="mt-14 grid gap-8 border-t border-line pt-10 sm:grid-cols-4">
          {[
            { label: "Guide entries", value: String(species.length) },
            { label: "Animals", value: String(animals) },
            { label: "Plants", value: String(plants) },
            { label: "At-risk taxa", value: String(atRisk) },
          ].map((item) => (
            <div key={item.label}>
              <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                {item.label}
              </dt>
              <dd className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="relative isolate overflow-hidden border-y border-line bg-mangrove-deep text-mist">
        <Image
          src="/images/species/philippine-pangolin.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[center_40%] opacity-[0.22]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-mangrove-deep/88 via-mangrove-deep/82 to-mangrove-deep/92" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist/50">
            Habitats
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-paper sm:text-4xl">
            Where Palawan wildlife still holds on
          </h2>
          <p className="mt-4 max-w-xl text-mist/70">
            Knowing the place helps you read the animal — and the risk to both.
          </p>
          <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
            {habitats.map((h, i) => (
              <div
                key={h.name}
                className="grid gap-5 py-8 sm:grid-cols-12 sm:items-center sm:gap-8"
              >
                <div className="relative aspect-[16/10] overflow-hidden sm:col-span-4 sm:aspect-[4/3]">
                  <Image
                    src={h.image}
                    alt={h.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="sm:col-span-8">
                  <p className="font-mono text-[11px] text-mist/45">0{i + 1}</p>
                  <h3 className="mt-2 font-display text-xl font-bold text-paper">
                    {h.name}
                  </h3>
                  <p className="mt-3 leading-relaxed text-mist/75">{h.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          How to use this
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          From a glimpse to a clear name
        </h2>
        <p className="mt-4 max-w-xl text-ink-soft">
          Three steps for visitors, students, and field partners — no account required on the
          public site.
        </p>
        <ol className="mt-12 divide-y divide-line border-y border-line">
          {howItWorks.map((item) => (
            <li
              key={item.step}
              className="grid gap-4 py-8 sm:grid-cols-12 sm:items-center sm:gap-6"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-signal sm:col-span-1">
                {item.step}
              </p>
              <div className="sm:col-span-7">
                <h3 className="font-display text-xl font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-ink-soft">{item.body}</p>
              </div>
              <div className="sm:col-span-4 sm:text-right">
                <Link
                  href={item.href}
                  className="inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-lagoon hover:underline"
                >
                  {item.cta} →
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-mist/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
                Priority watch
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Species under threat
              </h2>
              <p className="mt-3 max-w-xl text-ink-soft">
                Critically endangered, endangered, and vulnerable taxa from the live guide —
                start here if you only have a few minutes.
              </p>
            </div>
            <Link
              href="/species"
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-lagoon underline-offset-4 hover:underline"
            >
              Full catalogue →
            </Link>
          </div>

          <div className="mt-12 space-y-0 divide-y divide-line">
            {featured.map((s, i) => (
              <Link
                key={s.id}
                href={`/species/${s.slug}`}
                className="group grid gap-6 py-8 sm:grid-cols-12 sm:items-center"
              >
                <div
                  className={`relative aspect-[16/10] overflow-hidden bg-mangrove sm:col-span-5 ${
                    i % 2 === 1 ? "sm:order-2" : ""
                  }`}
                >
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 40vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className={`sm:col-span-7 ${i % 2 === 1 ? "sm:order-1 sm:pr-8" : "sm:pl-8"}`}>
                  <StatusBadge status={s.status} />
                  <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {s.name}
                  </h3>
                  <p className="mt-1 text-ink-soft">
                    {s.localName}
                    <span className="mx-2 text-line">·</span>
                    <span className="italic">{s.scientificName}</span>
                  </p>
                  <p className="mt-4 max-w-lg leading-relaxed text-ink-soft line-clamp-3">
                    {s.description}
                  </p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-soft">
                    Habitat · {s.habitat}
                  </p>
                  <span className="mt-5 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-signal">
                    Read entry →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          Pressure
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          What is pushing them out
        </h2>
        <p className="mt-4 max-w-xl text-ink-soft">
          Most at-risk entries in this guide share the same drivers: trade, habitat loss, and
          disturbance of remaining forest.
        </p>
        <div className="mt-10 divide-y divide-line border-y border-line">
          {[
            {
              title: "Illegal wildlife trade",
              body: "Pangolins for scales and meat, parrots for the pet trade — black markets strip endemics faster than they can recover.",
            },
            {
              title: "Habitat loss",
              body: "Clearing for farms, timber, and shoreline build-out removes foraging ground, nest trees, and quiet corridors.",
            },
            {
              title: "Disturbance & persecution",
              body: "Hunting, snaring, and noisy trails push shy forest animals out of the last patches that still hold them.",
            },
          ].map((t, i) => (
            <div key={t.title} className="grid gap-2 py-7 sm:grid-cols-12 sm:gap-6">
              <p className="font-mono text-[11px] text-ink-soft sm:col-span-1">0{i + 1}</p>
              <h3 className="font-display text-xl font-bold text-ink sm:col-span-4">{t.title}</h3>
              <p className="text-ink-soft sm:col-span-7">{t.body}</p>
            </div>
          ))}
        </div>
        <Link
          href="/conservation"
          className="mt-8 inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-lagoon hover:underline"
        >
          Full conservation brief →
        </Link>
      </section>

      <section className="relative isolate overflow-hidden border-y border-line bg-ink">
        <Image
          src="/images/species/saltwater-crocodile.jpg"
          alt="Saltwater crocodile in a Palawan wetland"
          fill
          sizes="100vw"
          className="object-cover object-[center_60%] opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/50" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist/50">
            Field notes
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-paper sm:text-4xl">
            {sightings.length} seeded sightings on the public map
          </h2>
          <p className="mt-4 max-w-lg text-mist/75">
            Seed data shows how location and date sit next to a species name. Students, visitors,
            and anyone with a community account can submit animal or plant reports for admin
            review — and earn yearly points when verified.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/map"
              className="bg-paper px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink hover:bg-mist"
            >
              Open map
            </Link>
            <Link
              href="/login"
              className="border border-paper/35 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-paper hover:border-paper"
            >
              Join as community
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          In the field
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Etiquette that keeps wildlife wild
        </h2>
        <p className="mt-4 max-w-xl text-ink-soft">
          A clear photo from a respectful distance beats a stressed animal every time.
        </p>
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {fieldTips.map((tip) => (
            <li key={tip} className="flex gap-4 py-5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-signal" aria-hidden />
              <p className="text-ink">{tip}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-ink-soft">
          Partners and emergency contacts live on the{" "}
          <Link href="/about" className="text-lagoon hover:underline">
            About
          </Link>{" "}
          page.
        </p>
      </section>

      <section className="border-t border-line bg-mist/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
            Start here
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Not sure what you saw?
          </h2>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            Photo ID works for plants and animals. Or open the guide and filter by category,
            status, and habitat.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/identify"
              className="bg-ink px-7 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-paper hover:bg-mangrove"
            >
              Open identify
            </Link>
            <Link
              href="/species"
              className="border border-line px-7 py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ink hover:border-ink"
            >
              Catalogue
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
