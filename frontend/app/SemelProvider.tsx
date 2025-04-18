"use client";

import { createContext, use, useEffect, useState } from "react";
import useSWR from "swr";
import { Semel } from "@/types";

export const SemelContext = createContext<Semel[]>([]);
export const SemelProvider = ({ children }: { children: React.ReactNode }) => {
  const [semels, setSemels] = useState<Semel[]>([]);
  const fetcher = (url: string): Promise<Semel[]> =>
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  const { data, error } = useSWR("http://localhost:8000/api/semlor", fetcher);

  useEffect(() => {
    if (data) {
      setSemels(data);
    }
  }, [data, error]);

  return (
    <SemelContext.Provider value={semels}>{children}</SemelContext.Provider>
  );
};
