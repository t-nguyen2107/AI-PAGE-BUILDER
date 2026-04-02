/**
 * Shared API response helpers.
 * All API routes should use these to ensure consistent response format:
 * `{ success, data?, error?, meta: { timestamp, requestId } }`
 */

export function successResponse<T>(data: T, status = 200) {
  return Response.json({
    success: true,
    data,
    meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
  }, { status });
}

export function errorResponse(code: string, message: string, status = 400) {
  return Response.json({
    success: false,
    error: { code, message },
    meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID() },
  }, { status });
}
