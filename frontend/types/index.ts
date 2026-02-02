import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

type ImageType = {
  image_url: string;
  id: string;
}

export type Semel = {
  id: number;
  bakery: string;
  city: string;
  picture: string;
  images: ImageType[];
  vegan: boolean;
  price: string;
  kind: string;
  rating: number;
};
export type SemelContextType = {
  semels: Semel[];
  isLoading: boolean;
  error: Error | null;
  refreshSemels: () => void;
};

export type CategoryRatings = {
  gradde: number;      // Cream
  mandelmassa: number; // Almond paste
  lock: number;        // Lid
  helhet: number;      // Overall
  bulle: number;       // Bun
};

export type Rating = Comment & {
  date: string;
};
export type Comment = {
  comment: string;
  rating: number;
  semelId: number;
  name?: string;
  // Category ratings (flattened)
  gradde?: number;
  mandelmassa?: number;
  lock?: number;
  helhet?: number;
  bulle?: number;
  categoryRatings?: CategoryRatings; // keeping for backward compatibility if needed, but primary structure is flat
};

export type SemelRatingsFetch = {
  ratings: Rating[];
  isLoading: boolean;
  isError: Error | null;
};

export type CommentResponse = {
  httpStatus: number;
  message: string;
};
