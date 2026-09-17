import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

/**
 * Wraps a route handler so every thrown AppError/ZodError maps to a
 * consistent JSON error response instead of an unhandled 500.
 */
export function apiHandler<Args extends unknown[]>(
  fn: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Girilen veriler geçersiz", issues: error.issues },
          { status: 422 },
        );
      }
      if (error instanceof AppError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      console.error(error);
      return NextResponse.json({ error: "Beklenmeyen bir hata oluştu" }, { status: 500 });
    }
  };
}
