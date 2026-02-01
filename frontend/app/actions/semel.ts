"use server";

import { Semel, Rating, CommentResponse, CategoryRatings } from "@/types";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:8000";

/** HTTP status code for internal server errors */
const HTTP_INTERNAL_SERVER_ERROR = 500;

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
 * Submits a rating for a specific semel with category ratings.
 * @param semelId The ID of the semel to rate
 * @param categoryRatings The category ratings (gradde, mandelmassa, lock, helhet, bulle)
 * @param comment Optional comment with the rating
 * @param image Optional image file to attach to the rating
 * @param name Optional name of the reviewer
 * @returns Promise<CommentResponse> Response with status and message
 */
export async function rateSemel(
  semelId: number,
  categoryRatings: CategoryRatings,
  comment: string = "",
  image?: File,
  name: string = "",
): Promise<CommentResponse> {
  try {
    let requestBody: FormData | string;
    const headers: Record<string, string> = {};

    if (image) {
      // Use FormData when image is provided
      const formData = new FormData();
      formData.append("gradde", categoryRatings.gradde.toString());
      formData.append("mandelmassa", categoryRatings.mandelmassa.toString());
      formData.append("lock", categoryRatings.lock.toString());
      formData.append("helhet", categoryRatings.helhet.toString());
      formData.append("bulle", categoryRatings.bulle.toString());
      formData.append("comment", comment);
      formData.append("name", name);
      formData.append("image", image);
      requestBody = formData;
      // Don't set Content-Type - browser will set it with boundary for multipart
    } else {
      // Use JSON for simple rating without image
      headers["Content-Type"] = "application/json";
      requestBody = JSON.stringify({
        comment,
        name,
        gradde: categoryRatings.gradde,
        mandelmassa: categoryRatings.mandelmassa,
        lock: categoryRatings.lock,
        helhet: categoryRatings.helhet,
        bulle: categoryRatings.bulle,
      });
    }

    const response = await fetch(`${BACKEND_URL}/api/rate/${semelId}`, {
      method: "POST",
      headers,
      body: requestBody,
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
      httpStatus: HTTP_INTERNAL_SERVER_ERROR,
      message: "Failed to submit rating. Please try again.",
    };
  }
}

/**
 * Response type for create semel operation
 */
type CreateSemelResponse =
  | { success: true; data: Semel }
  | { success: false; error: string; errors?: Record<string, string[]> };

/**
 * Creates a new semel with optional image uploads.
 * @param formData FormData containing bakery, city, price, kind, vegan, and pictures
 * @returns Promise<CreateSemelResponse> Response with success status and data or errors
 */
export async function createSemel(
  formData: FormData,
): Promise<CreateSemelResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/semlor/create`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 400) {
        return {
          success: false,
          error: "Validation failed",
          errors: data,
        };
      }
      return {
        success: false,
        error: data.error || "Failed to create semel",
      };
    }

    return {
      success: true,
      data,
    };
  } catch {
    return {
      success: false,
      error: "Failed to create semel. Please try again.",
    };
  }
}
