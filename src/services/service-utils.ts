import { supabase } from "@/integrations/supabase/client";
import type { ServiceResult } from "@/types/core";

/** Normalises unknown errors into a readable message. */
export function toMessage(error: unknown, fallback = "Something went wrong"): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

/** Wraps a service call so callers get a discriminated result instead of a throw. */
export async function guard<T>(fn: () => Promise<T>, fallback?: string): Promise<ServiceResult<T>> {
  try {
    return { data: await fn(), error: null };
  } catch (error) {
    return { data: null, error: toMessage(error, fallback) };
  }
}

/** Throws when a Supabase response carries an error, otherwise returns the data. */
export function unwrap<T>(response: { data: T; error: { message: string } | null }): T {
  if (response.error) throw new Error(response.error.message);
  return response.data;
}

export { supabase };

/** Like `unwrap`, but also throws when the row is missing. */
export function unwrapOne<T>(response: {
  data: T | null;
  error: { message: string } | null;
}): T {
  const data = unwrap(response);
  if (data === null || data === undefined) throw new Error("Record not found");
  return data;
}
