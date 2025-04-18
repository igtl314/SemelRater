"use client";

import { createContext, useEffect, useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { Semel, SemelContextType } from "@/types";

export const SemelContext = createContext<SemelContextType>({
  semels: [],
  isLoading: false,
  error: null,
  refreshSemels: () => {},
});
export const SemelProvider = ({ children }: { children: React.ReactNode }) => {
  const [semels, setSemels] = useState<Semel[]>([]);
  const fetcher = (url: string): Promise<Semel[]> =>
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

  const { data, error, isLoading } = useSWR(
    `http://${process.env.NEXT_PUBLIC_IP_KEY}/api/semlor`,
    fetcher,
  );
  const { trigger: refreshSemels } = useSWRMutation(
    `http://${process.env.NEXT_PUBLIC_IP_KEY}/api/semlor`,
    fetcher,
  );

  useEffect(() => {
    if (data) {
      setSemels(data);
    }
  }, [data, error]);

  return (
    <SemelContext.Provider value={{ semels, isLoading, error, refreshSemels }}>
      {children}
    </SemelContext.Provider>
  );
};
