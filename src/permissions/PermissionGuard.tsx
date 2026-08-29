import type { ReactNode } from "react";

import { usePermissions } from "../hooks/usePermissions";

type PermissionGuardProps = {
  permission: string;
  children: ReactNode;
};

export function PermissionGuard({
  permission,
  children,
}: PermissionGuardProps) {
  const { can } = usePermissions();

  if (!can(permission)) {
    return null;
  }

  return children;
}
