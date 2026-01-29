"use client";

import { createContext, useEffect, useState, useCallback } from "react";

import { Semel, SemelContextType } from "@/types";
import { getSemels } from "@/app/actions/semel";

export const SemelContext = createContext<SemelContextType>({
  semels: [],
  isLoading: false,
  error: null,
  refreshSemels: () => {},
});

export const SemelProvider = ({ children }: { children: React.ReactNode }) => {
  const [semels, setSemels] = useState<Semel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<SemelContextType["error"]>(null);

  const fetchSemels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSemels();

      setSemels(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch semels"),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSemels = fetchSemels;

  useEffect(() => {
    fetchSemels();
  }, [fetchSemels]);

  return (
    <SemelContext.Provider value={{ semels, isLoading, error, refreshSemels }}>
      {children}
    </SemelContext.Provider>
  );
};
