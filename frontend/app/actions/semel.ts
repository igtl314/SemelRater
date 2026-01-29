"use server";

import { Semel, Rating, CommentResponse } from "@/types";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:8000";

/** HTTP status codes */
const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Fetches all semels from the backend API.
 * @returns Promise<Semel[]> Array of semel objects
 * @throws Error if the fetch fails
 */
export async function getSemels(): Promise<Semel[]> {
  const response = await fetch(`${BACKEND_URL}/api/semlor`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch semels: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetches ratings for a specific semel from the backend API.
 * @param id The ID of the semel to fetch ratings for
 * @returns Promise<Rating[]> Array of rating objects
 * @throws Error if the fetch fails
 */
export async function getSemelRatings(id: number): Promise<Rating[]> {
  const response = await fetch(`${BACKEND_URL}/api/comments/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ratings: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Submits a rating for a specific semel.
 * @param semelId The ID of the semel to rate
 * @param rating The rating value (1-5)
 * @param comment Optional comment with the rating
 * @returns Promise<CommentResponse> Response with status and message
 */
export async function rateSemel(
  semelId: number,
  rating: number,
  comment: string = "",
): Promise<CommentResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/rate/${semelId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment, rating }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        httpStatus: response.status,
        message: data.error || "Failed to submit rating",
      };
    }

    return {
      httpStatus: response.status,
      message: data.message || "Rating saved successfully!",
    };
  } catch {
    return {
      httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: "Failed to submit rating. Please try again.",
    };
  }
}
