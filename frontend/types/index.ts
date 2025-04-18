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

export type Rating = {
  comment: string;
  rating: number;
  date: string;
}

