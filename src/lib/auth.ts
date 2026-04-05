/**
 * Authentication Placeholder — middleware for API route protection.
 *
 * TODO: Replace with real auth (NextAuth.js, Clerk, etc.) before production.
 * Currently allows all requests (prototype mode).
 */

import { NextRequest } from 'next/server';

export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  error?: string;
}

/**
 * Validate the incoming request's authentication.
 * Returns { authenticated: true } in prototype mode.
 *
 * Replace this function body with real auth logic:
 * - Extract session token / JWT from headers or cookies
 * - Verify against auth provider
 * - Return userId on success
 */
export async function requireAuth(_request: NextRequest): Promise<AuthResult> {
  // ─── PLACEHOLDER: Allow all requests ───
  // In production, replace with:
  //   const session = await getSession(request);
  //   if (!session) return { authenticated: false, error: 'Unauthorized' };
  //   return { authenticated: true, userId: session.userId };
  if (process.env.NODE_ENV === 'development') {
    console.warn('[auth] PLACEHOLDER AUTH ACTIVE — all requests allowed. Replace before production.');
  }

  return { authenticated: true, userId: 'prototype-user' };
}

/**
 * Check if the requester owns or has access to a project.
 * Returns true in prototype mode.
 *
 * Replace with real ownership check against your auth system.
 */
export async function canAccessProject(
  _request: NextRequest,
  _projectId: string,
): Promise<boolean> {
  // ─── PLACEHOLDER: Allow all access ───
  // In production:
  //   const auth = await requireAuth(request);
  //   if (!auth.authenticated) return false;
  //   const project = await prisma.project.findUnique({ where: { id: projectId } });
  //   return project?.ownerId === auth.userId;

  return true;
}
