import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type Semel = {
  id: number;
  bakery: string;
  city: string;
  picture: string;
  vegan: boolean;
  price: string;
  kind: string;
  rating: number;
};
export type SemelContextType = {
  semels: Semel[];
  isLoading: boolean;
  error: any;
}

export type Rating = Comment & {
  date: string;
}
export type Comment = {
  comment: string;
  rating: number;
  semelId: number;
}

export type SemelRatingsFetch = {
  ratings: Rating[];
  isLoading: boolean;
  isError: any;
}

export type CommentResponse = {
  httpStatus: number;
  message: string;
}
