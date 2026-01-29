"use client";

import { useEffect, useState, useCallback } from "react";

import { Rating, SemelRatingsFetch } from "@/types";
import { getSemelRatings } from "@/app/actions/semel";

export function useSemelComments(id: number): SemelRatingsFetch {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<Error | null>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setIsError(null);
    try {
      const data = await getSemelRatings(id);

      setRatings(data);
    } catch (err) {
      setIsError(
        err instanceof Error ? err : new Error("Failed to fetch ratings"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    ratings: ratings,
    isLoading,
    isError: isError,
  };
}
