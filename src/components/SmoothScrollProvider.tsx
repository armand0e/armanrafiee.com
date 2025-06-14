"use client";

import { useEffect, useRef, createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import Lenis from '@studio-freight/lenis';

interface LenisContextType {
  lenis: Lenis | null;
}

const LenisContext = createContext<LenisContextType | undefined>(undefined);

export const useLenis = () => {
  const context = useContext(LenisContext);
  if (context === undefined) {
    // In a real app, you might throw an error or return a default/mock Lenis instance
    // For now, we'll log a warning, as Navbar should be a child of the provider.
    console.warn("useLenis must be used within a LenisProvider");
  }
  return context;
};

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      syncTouch: true,
    });
    lenisRef.current = lenisInstance;
    setLenis(lenisInstance);

    function raf(time: number) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenisInstance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={{ lenis }}>
      {children}
    </LenisContext.Provider>
  );
} 