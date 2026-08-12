import { describe, expect, it } from "vitest";
import { hasPermission, hasAnyPermission, hasAllPermissions, getPendingHRStatusText } from "./rbac";
import type { SessionUser } from "./session";

const mockUser: SessionUser = {
  userAccountId: "account-1",
  authVersion: 1,
  membershipId: "membership-1",
  organizationId: "organization-1",
  roleKeys: ["manager"],
  email: "test@example.com",
  fullName: "Test User",
  employeeId: "emp-1",
  roleName: "manager",
  permissions: ["team_attendance", "approvals"]
};

describe("rbac", () => {
  describe("hasPermission", () => {
    it("returns false if user is null", () => {
      expect(hasPermission(null, "team_attendance")).toBe(false);
    });

    it("returns true if user has the permission", () => {
      expect(hasPermission(mockUser, "team_attendance")).toBe(true);
    });

    it("returns false if user does not have the permission", () => {
      expect(hasPermission(mockUser, "reports")).toBe(false);
    });

    it("verifies owner and hr have company_attendance permission whereas manager and employee do not", () => {
      const ownerUser: SessionUser = {
        ...mockUser,
        roleName: "owner",
        permissions: [
          "my_attendance",
          "manual_reports",
          "enrollment",
          "reports",
          "company_attendance"
        ]
      };
      const hrUser: SessionUser = {
        ...mockUser,
        roleName: "hr",
        permissions: [
          "my_attendance",
          "manual_reports",
          "enrollment",
          "reports",
          "company_attendance"
        ]
      };
      const managerUser: SessionUser = {
        ...mockUser,
        roleName: "manager",
        permissions: ["my_attendance", "manual_reports", "team_attendance", "approvals"]
      };
      const employeeUser: SessionUser = {
        ...mockUser,
        roleName: "employee",
        permissions: ["my_attendance", "manual_reports"]
      };

      expect(hasPermission(ownerUser, "company_attendance")).toBe(true);
      expect(hasPermission(hrUser, "company_attendance")).toBe(true);
      expect(hasPermission(managerUser, "company_attendance")).toBe(false);
      expect(hasPermission(employeeUser, "company_attendance")).toBe(false);
    });
  });

  describe("hasAnyPermission", () => {
    it("returns false if user is null", () => {
      expect(hasAnyPermission(null, ["team_attendance", "reports"])).toBe(false);
    });

    it("returns true if user has at least one of the permissions", () => {
      expect(hasAnyPermission(mockUser, ["team_attendance", "reports"])).toBe(true);
    });

    it("returns false if user has none of the permissions", () => {
      expect(hasAnyPermission(mockUser, ["reports", "enrollment"])).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("returns false if user is null", () => {
      expect(hasAllPermissions(null, ["team_attendance", "approvals"])).toBe(false);
    });

    it("returns true if user has all of the permissions", () => {
      expect(hasAllPermissions(mockUser, ["team_attendance", "approvals"])).toBe(true);
    });

    it("returns false if user is missing one of the permissions", () => {
      expect(hasAllPermissions(mockUser, ["team_attendance", "reports"])).toBe(false);
    });
  });

  describe("owner overrides", () => {
    const ownerUser: SessionUser = {
      userAccountId: "account-owner",
      authVersion: 1,
      membershipId: "membership-owner",
      organizationId: "organization-1",
      roleKeys: ["owner"],
      email: "owner@test.com",
      fullName: "Owner User",
      employeeId: "emp-owner",
      roleName: "owner",
      permissions: []
    };

    it("restricts owner from tracking personal attendance", () => {
      expect(hasPermission(ownerUser, "my_attendance")).toBe(false);
    });

    it("restricts owner from submitting manual requests", () => {
      expect(hasPermission(ownerUser, "manual_reports")).toBe(false);
    });

    it("grants owner all other permissions automatically", () => {
      expect(hasPermission(ownerUser, "team_attendance")).toBe(true);
      expect(hasPermission(ownerUser, "company_attendance")).toBe(true);
      expect(hasPermission(ownerUser, "approvals")).toBe(true);
      expect(hasPermission(ownerUser, "enrollment")).toBe(true);
      expect(hasPermission(ownerUser, "reports")).toBe(true);
      expect(hasPermission(ownerUser, "my_team")).toBe(true);
    });
  });

  describe("getPendingHRStatusText", () => {
    it("returns correct status text for attendance requests", () => {
      expect(getPendingHRStatusText("employee", "hr")).toBe("Pending Owner Approval");
      expect(getPendingHRStatusText("owner", "employee")).toBe("Pending Owner Approval");
      expect(getPendingHRStatusText("hr", "employee")).toBe("Stage 2: Awaiting HR Approval");
      expect(getPendingHRStatusText("manager", "employee")).toBe("Stage 2: Awaiting HR Approval");
    });

    it("returns correct status text for leave requests", () => {
      expect(getPendingHRStatusText("hr", "employee", true)).toBe("Pending Owner Approval");
      expect(getPendingHRStatusText("owner", "employee", true)).toBe("Pending Owner Approval");
      expect(getPendingHRStatusText("employee", "employee", true)).toBe("Pending HR Approval");
    });
  });
});
