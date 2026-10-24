import { useRef, useState, useEffect } from "react";

/**
 * Returns CSS class names for hybrid loading UX:
 * - While revalidating (data exists but refreshing): "animate-revalidating"
 * - When revalidation completes: "animate-content-fade-in" briefly
 */
export function useRevalidationFade(isValidating: boolean, isManualRefresh = true): string {
  const prevValidating = useRef(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Detect revalidation end: was validating → now not
    if (prevValidating.current && !isValidating) {
      setFadeIn(true);
      const timer = setTimeout(() => setFadeIn(false), 350);
      return () => clearTimeout(timer);
    }
    prevValidating.current = isValidating;
  }, [isValidating]);

  // Auto-revalidation: no dim/pulse — SlotValue handles individual number transitions
  if (!isManualRefresh) return "";

  if (isValidating) return "animate-revalidating";
  if (fadeIn) return "animate-content-fade-in";
  return "";
}
