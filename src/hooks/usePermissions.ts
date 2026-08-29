import { hasPermission } from "../permissions/permissions";
import { useAuthStore } from "../store/authStore";

export function usePermissions() {
  const permissions = useAuthStore(
    (state) => state.session?.permissions ?? [],
  );

  return {
    permissions,
    can: (permission: string) => hasPermission(permissions, permission),
  };
}
