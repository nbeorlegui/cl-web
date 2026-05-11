"use client";

import { useEffect, useState } from "react";

const heroImages = [
  "/hero/hero-1.png?v=3",
  "/hero/hero-2.png?v=3",
  "/hero/hero-3.png?v=3",
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full min-h-[calc(100vh-80px)] w-full overflow-hidden">
      {heroImages.map((src, index) => {
        const isActive = index === current;

        return (
          <img
            key={src}
            src={src}
            alt={`Hero CL Inmobiliaria ${index + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out ${
              isActive
                ? "opacity-70 scale-100 blur-0"
                : "opacity-0 scale-[1.03] blur-[1px]"
            }`}
            draggable={false}
          />
        );
      })}
    </div>
  );
}