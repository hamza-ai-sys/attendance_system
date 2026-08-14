"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { compareSync } from "bcryptjs";
import { createPrismaClient } from "@attendance/db";
import { signSessionToken } from "../../../lib/session-token";
import { getSessionSecret } from "../../../lib/session";
import { buildSessionUser, findUserAccessByEmail } from "../../../lib/authorization";

const db = createPrismaClient(process.env.DATABASE_URL as string);

export async function login(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const account = await findUserAccessByEmail(email.trim().toLowerCase());
  const sessionUser = account ? buildSessionUser(account) : null;

  if (!account || !sessionUser || !account.passwordHash) {
    return { error: "Invalid email or password." };
  }

  const passwordMatch = compareSync(password, account.passwordHash);

  if (!passwordMatch) {
    return { error: "Invalid email or password." };
  }

  const tokenPayload = {
    ...sessionUser,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour expiry as requested
  };

  const token = signSessionToken(tokenPayload, getSessionSecret());

  await db.userAccount.update({
    where: { id: account.id },
    data: { lastLoginAt: new Date() }
  });

  // Set HTTP-only cookie
  (await cookies()).set("attendance_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 // 1 hour
  });

  redirect("/");
}

export async function logout() {
  (await cookies()).delete("attendance_session");
  redirect("/login");
}
