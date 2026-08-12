import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  redirect: vi.fn(),
  findUserAccessById: vi.fn(),
  buildSessionUser: vi.fn()
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("./authorization", () => ({
  findUserAccessById: mocks.findUserAccessById,
  buildSessionUser: mocks.buildSessionUser
}));

import { getCurrentUser, requireCurrentUser } from "./session.js";
import { signSessionToken } from "./session-token.js";

const user = {
  userAccountId: "account-7",
  authVersion: 1,
  membershipId: "membership-7",
  organizationId: "organization-1",
  roleKeys: ["hr"],
  email: "hr@example.com",
  fullName: "Test HR",
  employeeId: "employee-7",
  roleName: "hr",
  permissions: ["reports"]
};

describe("getCurrentUser", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  beforeEach(() => {
    mocks.findUserAccessById.mockResolvedValue({ authVersion: 1 });
    mocks.buildSessionUser.mockReturnValue(user);
  });

  it("returns null when the session cookie is missing", async () => {
    vi.stubEnv("SESSION_SECRET", "test-session-secret");
    mocks.cookies.mockResolvedValue({ get: vi.fn().mockReturnValue(undefined) });

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns the user from a valid session cookie", async () => {
    vi.stubEnv("SESSION_SECRET", "test-session-secret");
    const token = signSessionToken(
      { ...user, exp: Math.floor(Date.now() / 1000) + 60 },
      "test-session-secret"
    );
    const getCookie = vi.fn().mockReturnValue({ value: token });
    mocks.cookies.mockResolvedValue({ get: getCookie });

    await expect(getCurrentUser()).resolves.toEqual(user);
    expect(getCookie).toHaveBeenCalledWith("attendance_session");
  });

  it("uses the development-only secret outside production", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("SESSION_SECRET", "");
    const token = signSessionToken(
      { ...user, exp: Math.floor(Date.now() / 1000) + 60 },
      "dev-only-session-secret"
    );
    mocks.cookies.mockResolvedValue({ get: vi.fn().mockReturnValue({ value: token }) });

    await expect(getCurrentUser()).resolves.toEqual(user);
  });

  it.each([undefined, "change-me-in-production"])(
    "rejects an unsafe production secret (%s)",
    async (sessionSecret) => {
      vi.stubEnv("NODE_ENV", "production");

      if (sessionSecret === undefined) {
        vi.stubEnv("SESSION_SECRET", "");
      } else {
        vi.stubEnv("SESSION_SECRET", sessionSecret);
      }

      await expect(getCurrentUser()).rejects.toThrow(
        "SESSION_SECRET must be set to a strong value in production."
      );
      expect(mocks.cookies).not.toHaveBeenCalled();
    }
  );
});

describe("requireCurrentUser", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  beforeEach(() => {
    mocks.findUserAccessById.mockResolvedValue({ authVersion: 1 });
    mocks.buildSessionUser.mockReturnValue(user);
  });

  it("redirects to login when the session cookie is missing", async () => {
    vi.stubEnv("SESSION_SECRET", "test-session-secret");
    mocks.cookies.mockResolvedValue({ get: vi.fn().mockReturnValue(undefined) });
    mocks.redirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(requireCurrentUser()).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.redirect).toHaveBeenCalledWith("/login");
  });

  it("returns the signed-in user", async () => {
    vi.stubEnv("SESSION_SECRET", "test-session-secret");
    const token = signSessionToken(
      { ...user, exp: Math.floor(Date.now() / 1000) + 60 },
      "test-session-secret"
    );
    mocks.cookies.mockResolvedValue({ get: vi.fn().mockReturnValue({ value: token }) });

    await expect(requireCurrentUser()).resolves.toEqual(user);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
