import { createPrismaClient, Prisma } from "@attendance/db";

const db = createPrismaClient(process.env.DATABASE_URL as string);

const userAccessInclude = Prisma.validator<Prisma.UserAccountInclude>()({
  person: {
    include: {
      memberships: {
        where: { status: "ACTIVE" },
        include: {
          organization: true,
          roleAssignments: {
        where: {
          revokedAt: null,
          validFrom: { lte: new Date() },
          OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }]
        },
        include: {
          role: {
            include: { permissions: { include: { permission: true } } }
          }
        }
          },
          employments: {
        where: { status: "ACTIVE" },
        orderBy: { hiredAt: "desc" },
        include: {
          assignments: {
            where: {
              validFrom: { lte: new Date() },
              OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }]
            },
            orderBy: { validFrom: "desc" },
            include: {
              organizationUnit: true,
              position: {
                include: {
                  defaultRoleMappings: {
                    include: {
                      role: {
                        include: { permissions: { include: { permission: true } } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
          }
        }
      }
    }
  }
});

/*
  The validity predicates are repeated in the include so Prisma can retain the exact payload type.
  Access is still reloaded on every request, so role revocation and account changes take effect
  without waiting for the signed cookie to expire.
*/
function getUserAccessInclude() {
  return userAccessInclude;
}

export async function findUserAccessByEmail(loginEmail: string) {
  return db.userAccount.findUnique({
    where: { loginEmail },
    include: getUserAccessInclude()
  });
}

export async function findUserAccessById(id: string) {
  return db.userAccount.findUnique({
    where: { id },
    include: getUserAccessInclude()
  });
}

export function buildSessionUser(account: NonNullable<Awaited<ReturnType<typeof findUserAccessById>>>) {
  const membership = account.person.memberships[0];
  const employment = membership?.employments[0];

  if (!membership || !employment || account.status !== "ACTIVE") return null;

  const currentAssignment = employment.assignments[0];
  const explicitRoles = membership.roleAssignments.map((assignment) => assignment.role);
  const positionRoles =
    currentAssignment?.position.defaultRoleMappings.map((mapping) => mapping.role) ?? [];
  const roles = [...explicitRoles, ...positionRoles];
  const roleKeys = [...new Set(roles.map((role) => role.key))];
  const permissions = [
    ...new Set(
      roles.flatMap((role) =>
        role.permissions
          .filter(({ permission }) => permission.isActive)
          .map(({ permission }) => permission.key)
      )
    )
  ];

  return {
    userAccountId: account.id,
    authVersion: account.authVersion,
    employeeId: employment.id,
    membershipId: membership.id,
    organizationId: membership.organizationId,
    email: account.loginEmail,
    fullName: account.person.preferredName ?? account.person.legalName,
    roleName: getPrimaryRoleName(roleKeys),
    roleKeys,
    permissions
  };
}

function getPrimaryRoleName(roleKeys: string[]) {
  const priority = ["owner", "org_admin", "hr", "manager", "employee"];
  return priority.find((role) => roleKeys.includes(role)) ?? roleKeys[0] ?? "employee";
}
