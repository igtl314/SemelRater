"use server";

import { Semel, Rating, CommentResponse } from "@/types";

const BACKEND_URL = process.env.BACKEND_URL || "http://backend:8000";

export async function getSemels(): Promise<Semel[]> {
  try {
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
  } catch (error) {
    console.error("Error fetching semels:", error);

    return [];
  }
}

export async function getSemelComments(id: number): Promise<Rating[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/comments/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching comments:", error);

    return [];
  }
}

export async function rateSemel(
  semelId: number,
  rating: number,
  comment: string,
): Promise<CommentResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/rate/${semelId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: comment,
        rating: rating,
      }),
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
  } catch (error) {
    console.error("Error submitting rating:", error);

    return {
      httpStatus: 500,
      message: "Failed to submit comment. Please try again.",
    };
  }
}
