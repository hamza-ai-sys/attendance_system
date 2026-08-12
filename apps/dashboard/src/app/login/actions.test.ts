import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as AttendanceDb from "@attendance/db";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  cookies: vi.fn(),
  compareSync: vi.fn(),
  signSessionToken: vi.fn(),
  findUserAccessByEmail: vi.fn(),
  buildSessionUser: vi.fn(),
  db: { userAccount: { update: vi.fn() } }
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("bcryptjs", () => ({ compareSync: mocks.compareSync }));
vi.mock("@attendance/db", async (importOriginal) => {
  const actual: typeof AttendanceDb = await importOriginal();
  return { ...actual, createPrismaClient: () => mocks.db };
});
vi.mock("../../lib/authorization", () => ({
  findUserAccessByEmail: mocks.findUserAccessByEmail,
  buildSessionUser: mocks.buildSessionUser
}));
vi.mock("../../lib/session-token", () => ({ signSessionToken: mocks.signSessionToken }));

import { login, logout } from "./actions";

const sessionUser = {
  userAccountId: "account-1",
  authVersion: 1,
  employeeId: "employment-1",
  membershipId: "membership-1",
  organizationId: "organization-1",
  email: "owner@test.com",
  fullName: "Test Owner",
  roleName: "owner",
  roleKeys: ["owner"],
  permissions: ["enrollment"]
};

function credentials(email = "owner@test.com", password = "correctpass") {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("password", password);
  return formData;
}

describe("login actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findUserAccessByEmail.mockResolvedValue({
      id: "account-1",
      authVersion: 1,
      status: "ACTIVE",
      passwordHash: "hash"
    });
    mocks.buildSessionUser.mockReturnValue(sessionUser);
  });

  afterEach(() => vi.unstubAllEnvs());

  it("requires email and password", async () => {
    const formData = new FormData();
    formData.set("email", "test@test.com");
    await expect(login(null, formData)).resolves.toEqual({
      error: "Email and password are required."
    });
  });

  it("rejects an unknown account", async () => {
    mocks.findUserAccessByEmail.mockResolvedValue(null);
    await expect(login(null, credentials("missing@test.com"))).resolves.toEqual({
      error: "Invalid email or password."
    });
  });

  it("rejects an invalid password", async () => {
    mocks.compareSync.mockReturnValue(false);
    await expect(login(null, credentials())).resolves.toEqual({
      error: "Invalid email or password."
    });
  });

  it("rejects an account without an active employment context", async () => {
    mocks.buildSessionUser.mockReturnValue(null);
    await expect(login(null, credentials())).resolves.toEqual({
      error: "Invalid email or password."
    });
    expect(mocks.compareSync).not.toHaveBeenCalled();
  });

  it("creates a session and records login time", async () => {
    mocks.compareSync.mockReturnValue(true);
    mocks.signSessionToken.mockReturnValue("mock-jwt-token");
    const set = vi.fn();
    mocks.cookies.mockResolvedValue({ set });

    await login(null, credentials());

    expect(mocks.signSessionToken).toHaveBeenCalledWith(
      expect.objectContaining(sessionUser),
      expect.any(String)
    );
    expect(mocks.db.userAccount.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "account-1" } })
    );
    expect(set).toHaveBeenCalledWith("attendance_session", "mock-jwt-token", expect.any(Object));
    expect(mocks.redirect).toHaveBeenCalledWith("/");
  });

  it("rejects an unsafe production session secret", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SESSION_SECRET", "");
    mocks.compareSync.mockReturnValue(true);

    await expect(login(null, credentials())).rejects.toThrow(
      "SESSION_SECRET must be set to a strong value in production."
    );
  });

  it("deletes the session cookie on logout", async () => {
    const remove = vi.fn();
    mocks.cookies.mockResolvedValue({ delete: remove });
    await logout();
    expect(remove).toHaveBeenCalledWith("attendance_session");
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });
});
