import { useEffect } from "react";

import { refreshSessionForUser } from "../services/team/teamService";
import { useAuthStore } from "../store/authStore";
import { useOrganizationStore } from "../store/organizationStore";

export function useSyncProductPermissions() {
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const currentBrandId = useOrganizationStore((state) => state.currentBrandId);

  useEffect(() => {
    if (!session || session.user.role === "SUPER_ADMIN" || session.source === "api") return;

    const next = refreshSessionForUser(session.user.id, currentBrandId);
    if (!next) return;

    const samePerms =
      next.permissions.join("|") === session.permissions.join("|");
    const sameBrands =
      next.assignedBrandIds.join("|") === session.assignedBrandIds.join("|");

    if (!samePerms || !sameBrands) {
      setSession(next);
    }
  }, [currentBrandId, session, setSession]);
}
