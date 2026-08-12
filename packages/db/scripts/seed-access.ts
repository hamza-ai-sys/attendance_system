import type { Prisma } from "@prisma/client";

export const defaultRolePermissions = {
  employee: ["my_attendance", "manual_reports"],
  manager: ["my_attendance", "manual_reports", "team_attendance", "approvals", "my_team"],
  hr: [
    "my_attendance",
    "manual_reports",
    "enrollment",
    "reports",
    "company_attendance",
    "approvals",
    "my_team",
    "jobs_manage",
    "announcements_manage"
  ],
  owner: [
    "my_attendance",
    "manual_reports",
    "enrollment",
    "reports",
    "company_attendance",
    "approvals",
    "my_team",
    "jobs_manage",
    "announcements_manage"
  ]
} as const;

const unitDefinitions = [
  { code: "EXEC", name: "Executive", type: "DEPARTMENT" as const },
  { code: "HR", name: "Human Resources", type: "DEPARTMENT" as const },
  { code: "ENG", name: "Engineering", type: "DEPARTMENT" as const },
  { code: "OPS", name: "Operations", type: "DEPARTMENT" as const }
];

const positionDefinitions = [
  { code: "OWNER", title: "Owner", roleKey: "owner", scope: "ORGANIZATION" as const },
  { code: "HR_OFFICER", title: "HR Officer", roleKey: "hr", scope: "ORGANIZATION" as const },
  {
    code: "MANAGER",
    title: "Manager",
    roleKey: "manager",
    scope: "ORGANIZATION_UNIT_TREE" as const
  },
  { code: "EMPLOYEE", title: "Employee", roleKey: "employee", scope: "SELF" as const }
];

export async function seedAccessFoundation(
  tx: Prisma.TransactionClient,
  organization: { name: string; slug: string }
) {
  const organizationRecord = await tx.organization.upsert({
    where: { slug: organization.slug },
    create: { ...organization, timezone: "Asia/Karachi" },
    update: { name: organization.name, isActive: true }
  });

  const permissionKeys = [...new Set(Object.values(defaultRolePermissions).flat())];
  const permissions = new Map<string, string>();
  for (const key of permissionKeys) {
    const permission = await tx.permission.upsert({
      where: { key },
      create: { key, name: titleCase(key), category: key.split("_")[0] ?? "general" },
      update: { isActive: true }
    });
    permissions.set(key, permission.id);
  }

  const roles = new Map<string, { id: string }>();
  for (const [key, assignedPermissions] of Object.entries(defaultRolePermissions)) {
    const role = await tx.role.upsert({
      where: { organizationId_key: { organizationId: organizationRecord.id, key } },
      create: {
        organizationId: organizationRecord.id,
        key,
        name: titleCase(key),
        isSystem: true
      },
      update: { isActive: true, name: titleCase(key) }
    });
    roles.set(key, role);
    await tx.rolePermission.deleteMany({ where: { roleId: role.id } });
    await tx.rolePermission.createMany({
      data: assignedPermissions.map((permissionKey) => ({
        roleId: role.id,
        permissionId: permissions.get(permissionKey)!
      }))
    });
  }

  const units = new Map<string, { id: string }>();
  for (const definition of unitDefinitions) {
    const unit = await tx.organizationUnit.upsert({
      where: {
        organizationId_code: {
          organizationId: organizationRecord.id,
          code: definition.code
        }
      },
      create: { ...definition, organizationId: organizationRecord.id },
      update: { name: definition.name, type: definition.type, isActive: true }
    });
    units.set(definition.code, unit);
  }

  const positions = new Map<string, { id: string }>();
  for (const definition of positionDefinitions) {
    const position = await tx.position.upsert({
      where: {
        organizationId_code: {
          organizationId: organizationRecord.id,
          code: definition.code
        }
      },
      create: {
        organizationId: organizationRecord.id,
        code: definition.code,
        title: definition.title
      },
      update: { title: definition.title, isActive: true }
    });
    positions.set(definition.code, position);
    await tx.positionRoleMapping.upsert({
      where: {
        positionId_roleId_scope: {
          positionId: position.id,
          roleId: roles.get(definition.roleKey)!.id,
          scope: definition.scope
        }
      },
      create: {
        positionId: position.id,
        roleId: roles.get(definition.roleKey)!.id,
        scope: definition.scope
      },
      update: {}
    });
  }

  return { organization: organizationRecord, permissions, roles, units, positions };
}

export async function upsertSeedEmployment(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    legalName: string;
    loginEmail: string;
    passwordHash: string;
    employeeCode: string;
    unitId: string;
    positionId: string;
    timezone?: string;
    shiftInTime?: string;
    shiftOutTime?: string;
  }
) {
  const account = await tx.userAccount.upsert({
    where: { loginEmail: input.loginEmail },
    create: {
      loginEmail: input.loginEmail,
      passwordHash: input.passwordHash,
      status: "ACTIVE",
      person: {
        create: { legalName: input.legalName, personalEmail: input.loginEmail }
      }
    },
    update: {
      passwordHash: input.passwordHash,
      status: "ACTIVE",
      person: {
        update: { legalName: input.legalName, personalEmail: input.loginEmail }
      }
    },
    include: { person: true }
  });

  const membership = await tx.organizationMembership.upsert({
    where: {
      organizationId_personId: {
        organizationId: input.organizationId,
        personId: account.personId
      }
    },
    create: {
      organizationId: input.organizationId,
      personId: account.personId,
      status: "ACTIVE",
      joinedAt: new Date()
    },
    update: { status: "ACTIVE", endedAt: null }
  });

  const existingEmployment =
    (await tx.employment.findUnique({
      where: {
        organizationId_employeeCode: {
          organizationId: input.organizationId,
          employeeCode: input.employeeCode
        }
      }
    })) ??
    (await tx.employment.findFirst({
      where: { organizationId: input.organizationId, membershipId: membership.id, endedAt: null },
      orderBy: { hiredAt: "desc" }
    }));

  const employment = existingEmployment
    ? await tx.employment.update({
        where: { id: existingEmployment.id },
        data: {
          membershipId: membership.id,
          employeeCode: input.employeeCode,
          status: "ACTIVE",
          endedAt: null
        }
      })
    : await tx.employment.create({
        data: {
      organizationId: input.organizationId,
      membershipId: membership.id,
      employeeCode: input.employeeCode,
      status: "ACTIVE",
      hiredAt: new Date()
        }
      });

  await tx.employmentAssignment.deleteMany({ where: { employmentId: employment.id } });
  await tx.employmentAssignment.create({
    data: {
      employmentId: employment.id,
      organizationUnitId: input.unitId,
      positionId: input.positionId,
      validFrom: new Date(),
      timezone: input.timezone ?? "Asia/Karachi"
    }
  });

  let shift = await tx.shift.findFirst({
    where: {
      name: `${input.employeeCode} default shift`,
      startTime: input.shiftInTime ?? "09:00",
      endTime: input.shiftOutTime ?? "17:00"
    }
  });
  shift ??= await tx.shift.create({
    data: {
      name: `${input.employeeCode} default shift`,
      timezone: input.timezone ?? "Asia/Karachi",
      startTime: input.shiftInTime ?? "09:00",
      endTime: input.shiftOutTime ?? "17:00",
      workdays: [1, 2, 3, 4, 5]
    }
  });
  await tx.shiftAssignment.deleteMany({ where: { employeeId: employment.id } });
  await tx.shiftAssignment.create({
    data: { employeeId: employment.id, shiftId: shift.id, effectiveFrom: new Date() }
  });

  return { account, employment, membership };
}

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
