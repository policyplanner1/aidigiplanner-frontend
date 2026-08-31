// Mock/demo-data workspace fallback (mockAuth.ts / projectService.ts) is disabled below —
// the app now always resolves the workspace from the live API session.
// import { getOrganizationById } from "../services/auth/mockAuth";
import { mapOrganizationFromSession } from "../services/auth/mapSession";
// import { getProjectsForSession } from "../services/projects/projectService";
import { useAuthStore } from "../store/authStore";
import { useOrganizationStore } from "../store/organizationStore";

export function useWorkspace() {
  const session = useAuthStore((state) => state.session);
  const currentBrandId = useOrganizationStore((state) => state.currentBrandId);
  const currentSubProductId = useOrganizationStore((state) => state.currentSubProductId);
  const liveProjects = useOrganizationStore((state) => state.liveProjects);
  const liveSubProducts = useOrganizationStore((state) => state.liveSubProducts);
  const revision = useOrganizationStore((state) => state.revision);
  const setCurrentBrandId = useOrganizationStore((state) => state.setCurrentBrandId);
  const setCurrentSubProductId = useOrganizationStore((state) => state.setCurrentSubProductId);

  void revision;

  // const isApi = session?.source === "api";
  const organization = session ? mapOrganizationFromSession(session) : null;
  // : getOrganizationById(session?.organizationId ?? null);

  const projects = liveProjects;
  // : session
  //   ? getProjectsForSession(session)
  //   : [];

  const currentProject =
    projects.find((project) => project.id === currentBrandId) ??
    projects[0] ??
    null;

  const subProducts = liveSubProducts;
  const currentSubProduct =
    subProducts.find((item) => item.id === currentSubProductId) ?? null;

  return {
    organization,
    projects,
    brands: projects,
    currentProject,
    currentBrand: currentProject,
    subProducts,
    currentSubProduct,
    setCurrentBrandId,
    setCurrentProjectId: setCurrentBrandId,
    setCurrentSubProductId,
  };
}
