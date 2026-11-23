import Link from "next/link";

const usefulLinks = [
  { href: "/about", label: "About" },
  { href: "/species", label: "Species & Plants" },
  { href: "/identify", label: "Identify" },
  { href: "/conservation", label: "Conservation" },
  { href: "/map", label: "Sightings map" },
];

const social = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <path
        d="M14 8h-2a2 2 0 00-2 2v2H8v3h2v7h3v-7h2.5l.5-3H13v-1.5c0-.3.2-.5.5-.5H15V8h-1z"
        fill="currentColor"
      />
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <>
        <rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16.5" cy="7.5" r="0.9" fill="currentColor" />
      </>
    ),
  },
  {
    label: "X",
    href: "https://x.com",
    icon: (
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <>
        <path d="M7.5 10v7M7.5 7.2v.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M11 17v-4.2c0-1.5.9-2.3 2.1-2.3 1.1 0 1.9.7 1.9 2.3V17M11 10.2V17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-mist/60 text-ink sm:mt-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 text-center sm:grid-cols-2 sm:gap-12 sm:py-14 lg:grid-cols-3 lg:gap-16">
        {/* About */}
        <div className="flex flex-col items-center">
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">About</h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
            Palawan Wildlife is a field guide and sighting desk for endemic species of Palawan —
            helping residents and visitors identify what they see and report it to people who can
            act.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 text-ink transition hover:border-ink hover:bg-ink hover:text-paper"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                  {s.icon}
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Useful links */}
        <div className="flex flex-col items-center">
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">
            Useful Links
          </h2>
          <ul className="mt-4 space-y-3.5 text-sm text-ink-soft">
            {usefulLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-block py-0.5 transition hover:text-ink hover:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col items-center sm:col-span-2 lg:col-span-1">
          <h2 className="font-display text-xl font-bold tracking-tight text-ink">Contact</h2>
          <ul className="mt-4 space-y-4 text-sm text-ink-soft">
            <li className="flex justify-center gap-3">
              <PinIcon />
              <span>
                Puerto Princesa City
                <br />
                Palawan, Philippines
              </span>
            </li>
            <li>
              <a
                href="mailto:field@palawanwildlife.ph"
                className="inline-flex items-center justify-center gap-3 break-all transition hover:text-ink"
              >
                <MailIcon />
                field@palawanwildlife.ph
              </a>
            </li>
            <li>
              <a
                href="tel:+639171234567"
                className="inline-flex items-center justify-center gap-3 transition hover:text-ink"
              >
                <PhoneIcon />
                +63 917 123 4567
              </a>
            </li>
          </ul>
          <p className="mt-5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-ink-soft/70">
            Rescue hotline · replace with official number
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs leading-relaxed text-ink-soft">
          © {new Date().getFullYear()} Palawan Wildlife. All rights reserved. Built for
          conservation education in Palawan.
        </p>
      </div>
    </footer>
  );
}

function PinIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-ink" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-ink" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-ink" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.5 4.5h3l1 4-2 1.5a12 12 0 005.5 5.5l1.5-2 4 1v3c0 1-1 2-2.2 2C10 19.5 4.5 14 4.5 6.7c0-1.2 1-2.2 2-2.2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
