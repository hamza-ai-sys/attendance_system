export const employmentIdentityInclude = {
  membership: {
    include: {
      person: {
        include: { userAccount: true }
      }
    }
  }
} as const;

export function employmentAccessInclude() {
  return {
    membership: {
      include: {
        person: { include: { userAccount: true } },
        roleAssignments: {
          where: { revokedAt: null },
          include: { role: true }
        }
      }
    },
    assignments: {
      where: currentAssignmentWhere(),
      include: {
        organizationUnit: true,
        position: { include: { defaultRoleMappings: { include: { role: true } } } }
      },
      orderBy: { validFrom: "desc" as const },
      take: 1
    }
  };
}

type EmploymentIdentity = {
  membership: {
    person: {
      legalName: string;
      preferredName: string | null;
      userAccount: { loginEmail: string } | null;
    };
  };
};

export function getEmploymentName(employment: EmploymentIdentity) {
  const person = employment.membership.person;
  return person.preferredName ?? person.legalName;
}

export function getEmploymentEmail(employment: EmploymentIdentity) {
  return employment.membership.person.userAccount?.loginEmail ?? "No account";
}

type EmploymentRoles = {
  membership: { roleAssignments?: Array<{ role: { key: string } }> };
  assignments?: Array<{
    position: { defaultRoleMappings: Array<{ role: { key: string; name?: string } }> };
  }>;
};

export function getEmploymentRoleKey(employment: EmploymentRoles) {
  const keys = [
    ...(employment.membership.roleAssignments?.map(({ role }) => role.key) ?? []),
    ...(employment.assignments?.flatMap(({ position }) =>
      position.defaultRoleMappings.map(({ role }) => role.key)
    ) ?? [])
  ];
  return ["owner", "org_admin", "hr", "manager", "employee"].find((key) => keys.includes(key)) ??
    keys[0] ??
    "employee";
}

export function currentAssignmentWhere() {
  return {
    validFrom: { lte: new Date() },
    OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }]
  };
}

export function currentReportingLineWhere() {
  return {
    type: "PRIMARY" as const,
    validFrom: { lte: new Date() },
    OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }]
  };
}
