"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";

import { Rating, SemelRatingsFetch } from "@/types";

export function useSemelComments(id: number): SemelRatingsFetch {
  const [ratings, setRatings] = useState<Rating[]>([]);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error, isLoading } = useSWR<Rating[]>(
    `https://${process.env.NEXT_PUBLIC_IP_ADRESS}:${process.env.NEXT_PUBLIC_BACKEND_PORT}/api/comments/${id}`,
    fetcher,
  );

  useEffect(() => {
    if (data) {
      setRatings(data);
    }
  }, [data, error]);

  return {
    ratings: ratings,
    isLoading,
    isError: error,
  };
}
