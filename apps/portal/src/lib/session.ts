import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifySessionToken } from "./session-token";
import { buildSessionUser, findUserAccessById } from "./authorization";

export type SessionUser = {
  userAccountId: string;
  authVersion: number;
  employeeId: string;
  membershipId: string;
  organizationId: string;
  email: string;
  fullName: string;
  roleName: string;
  roleKeys: string[];
  permissions: string[];
};

const sessionCookieName = "attendance_session";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const sessionSecret = getSessionSecret();
  const sessionCookie = (await cookies()).get(sessionCookieName);

  if (!sessionCookie) {
    return null;
  }

  const tokenUser = verifySessionToken(sessionCookie.value, sessionSecret);
  if (!tokenUser) return null;

  const account = await findUserAccessById(tokenUser.userAccountId);
  if (!account || account.authVersion !== tokenUser.authVersion) return null;

  return buildSessionUser(account);
}

export async function requireCurrentUser(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export function getSessionSecret() {
  const sessionSecret = process.env.SESSION_SECRET;

  if (!sessionSecret || sessionSecret === "change-me-in-production") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET must be set to a strong value in production.");
    }

    return "dev-only-session-secret";
  }

  return sessionSecret;
}
