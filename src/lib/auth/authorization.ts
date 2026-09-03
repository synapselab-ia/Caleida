import "server-only";

import { getServerSession } from "./server";

export const PRODUCT_ROLES = [
  "proprietário",
  "administrador",
  "moderador",
  "curador",
  "usuário",
] as const;

export type ProductRole = (typeof PRODUCT_ROLES)[number];

const ADMIN_ASSIGNABLE_ROLES = new Set<ProductRole>([
  "usuário",
  "curador",
  "moderador",
]);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Uma sessão autenticada válida é obrigatória.");
    this.name = "AuthenticationRequiredError";
  }
}

export class ProductAuthorizationError extends Error {
  constructor() {
    super("A identidade autenticada não possui autorização para esta operação.");
    this.name = "ProductAuthorizationError";
  }
}

export type RoleChangeAuthorization = {
  actorAuthUserId: string;
  actorRole: ProductRole;
  targetAuthUserId: string;
  targetRole: ProductRole | null;
  newRole: ProductRole;
};

export function isProductRole(value: unknown): value is ProductRole {
  return (
    typeof value === "string" &&
    (PRODUCT_ROLES as readonly string[]).includes(value)
  );
}

export async function requireAuthenticatedAuthUserId() {
  const session = await getServerSession();
  const authUserId = session?.user?.id;

  if (typeof authUserId !== "string" || !UUID_PATTERN.test(authUserId)) {
    throw new AuthenticationRequiredError();
  }

  return authUserId;
}

export function canChangeProductRole({
  actorAuthUserId,
  actorRole,
  targetAuthUserId,
  targetRole,
  newRole,
}: RoleChangeAuthorization) {
  if (actorAuthUserId === targetAuthUserId) {
    return false;
  }

  if (actorRole === "proprietário") {
    return true;
  }

  if (actorRole !== "administrador") {
    return false;
  }

  if (targetRole === "proprietário" || targetRole === "administrador") {
    return false;
  }

  return ADMIN_ASSIGNABLE_ROLES.has(newRole);
}

export function assertCanChangeProductRole(
  authorization: RoleChangeAuthorization,
) {
  if (!canChangeProductRole(authorization)) {
    throw new ProductAuthorizationError();
  }
}

export function assertProductRoleAllowed(
  actualRole: ProductRole | null,
  allowedRoles: readonly ProductRole[],
) {
  if (!actualRole || !allowedRoles.includes(actualRole)) {
    throw new ProductAuthorizationError();
  }
}
