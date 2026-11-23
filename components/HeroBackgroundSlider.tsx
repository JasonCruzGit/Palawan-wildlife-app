"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/images/hero-pangolin.png",
    alt: "Philippine pangolin mother carrying her pup through forest undergrowth",
    position: "object-[center_45%]",
  },
  {
    src: "/images/species/palawan-peacock-pheasant.jpg",
    alt: "Palawan peacock-pheasant in forest understory",
    position: "object-[center_40%]",
  },
  {
    src: "/images/species/palawan-hornbill.jpg",
    alt: "Palawan hornbill in the canopy",
    position: "object-center",
  },
  {
    src: "/images/species/palawan-bearcat.jpg",
    alt: "Palawan bearcat in forest cover",
    position: "object-[center_35%]",
  },
  {
    src: "/images/species/philippine-pangolin.jpg",
    alt: "Philippine pangolin on the forest floor",
    position: "object-[center_50%]",
  },
];

const INTERVAL_MS = 6000;

export default function HeroBackgroundSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      {slides.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={i === index ? slide.alt : ""}
          fill
          priority={i === 0}
          sizes="100vw"
          aria-hidden={i !== index}
          className={`object-cover transition-opacity duration-[1400ms] ease-out ${slide.position} ${
            i === index ? "hero-zoom opacity-70" : "scale-105 opacity-0"
          }`}
        />
      ))}

      <div
        className="absolute bottom-28 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 md:bottom-8"
        role="tablist"
        aria-label="Hero background slides"
      >
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show slide ${i + 1}: ${slide.alt}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 transition-all duration-300 ${
              i === index ? "w-8 bg-signal" : "w-1.5 bg-paper/45 hover:bg-paper/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
