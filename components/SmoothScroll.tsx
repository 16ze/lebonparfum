"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

interface SmoothScrollProps {
  children: React.ReactNode;
}

/**
 * SmoothScroll Wrapper - Byredo-style heavy, luxurious scrolling
 * Utilise Lenis pour un effet de scroll "lourd" et premium
 */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialisation de Lenis avec paramètres luxury (scroll lourd)
    lenisRef.current = new Lenis({
      duration: 1.2, // Durée du smooth (plus c'est élevé, plus c'est lourd)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing custom
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });

    // Loop d'animation (RAF)
    function raf(time: number) {
      lenisRef.current?.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenisRef.current?.destroy();
    };
  }, []);

  return <>{children}</>;
}
