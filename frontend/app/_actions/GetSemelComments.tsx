import { useEffect, useState } from "react";
import { Rating, SemelRatingsFetch } from "@/types";
import useSWR from "swr";

export function useSemelComments(id: number): SemelRatingsFetch {
  const [ratings, setRatings] = useState<Rating[]>([]);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, error, isLoading } = useSWR<Rating[]>(
    `/api/${id}/comments`,
    fetcher
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
