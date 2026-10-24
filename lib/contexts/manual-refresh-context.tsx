"use client";

import { createContext, useContext, useCallback, useRef, useState } from "react";

interface ManualRefreshContextValue {
  isManualRefresh: boolean;
  triggerManualRefresh: () => void;
}

const ManualRefreshContext = createContext<ManualRefreshContextValue>({
  isManualRefresh: false,
  triggerManualRefresh: () => {},
});

export function ManualRefreshProvider({ children }: { children: React.ReactNode }) {
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const triggerManualRefresh = useCallback(() => {
    setIsManualRefresh(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsManualRefresh(false), 5000);
  }, []);

  return (
    <ManualRefreshContext.Provider value={{ isManualRefresh, triggerManualRefresh }}>
      {children}
    </ManualRefreshContext.Provider>
  );
}

export function useManualRefresh() {
  return useContext(ManualRefreshContext);
}
