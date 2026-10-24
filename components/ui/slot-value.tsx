"use client";

import { useRef, useState, useEffect } from "react";

interface SlotValueProps {
  value: string;
  className?: string;
}

export function SlotValue({ value, className = "" }: SlotValueProps) {
  const [displayed, setDisplayed] = useState(value);
  const [previous, setPrevious] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setDisplayed(value);
      return;
    }

    if (value === displayed) return;

    setPrevious(displayed);
    setDisplayed(value);

    const timer = setTimeout(() => setPrevious(null), 350);
    return () => clearTimeout(timer);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  if (previous === null) {
    return <span className={className}>{displayed}</span>;
  }

  return (
    <span className={`slot-value-container ${className}`}>
      <span className="slot-value-exit" aria-hidden>
        {previous}
      </span>
      <span className="slot-value-enter">
        {displayed}
      </span>
    </span>
  );
}
