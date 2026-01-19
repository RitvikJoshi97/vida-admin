"use client";

import { useEffect, useState } from "react";

type PageRevealOverlayProps = {
  className?: string;
};

export default function PageRevealOverlay({
  className,
}: PageRevealOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide overlay after animation completes
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 720); // Match page-reveal animation duration

    return () => clearTimeout(timeout);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-50 bg-white page-reveal ${className ?? ""}`}
    />
  );
}
