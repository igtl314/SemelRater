import { Rating } from "@/types";
import useSWR from 'swr';

export function useSemelComments(id: string) {
    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    const { data, error, isLoading } = useSWR<Rating[]>(
        `/api/${id}/comments`,
        fetcher
    );

    return {
        comments: data,
        isLoading,
        isError: error
    };
}