import type { OnboardingStep } from "../../types/onboarding";

// The 9 routed onboarding screens, in order (spec §8-18).
export const ONBOARDING_STEPS = [
  "company-structure",
  "company-profile",
  "brand-analysis",
  "brand-review",
  "products",
  "sub-products",
  "social-accounts",
  "team",
  "completed",
] as const;

export type OnboardingStepPath = (typeof ONBOARDING_STEPS)[number];

export function onboardingStepIndex(path: string | undefined): number {
  const index = ONBOARDING_STEPS.indexOf(path as OnboardingStepPath);
  return index === -1 ? 0 : index;
}

// The backend only records progress at 6 checkpoints (app.models.enums per
// OnboardingStep) — coarser than our 9 UI screens. This maps each checkpoint to
// the earliest UI step it unlocks; steps between two checkpoints are reachable
// once the earlier checkpoint is hit; a user resumes at the mapped step for
// their current checkpoint, but revisiting an earlier step (e.g. via Back) is
// always allowed.
export function resumeStepForStatus(step: OnboardingStep | string | undefined): OnboardingStepPath {
  switch (step) {
    case "brand_structure_selected":
      return "company-profile";
    case "brand_profile_completed":
      return "products";
    case "first_product_created":
      return "sub-products";
    case "completed":
      return "completed";
    case "registered":
    case "email_verified":
    default:
      return "company-structure";
  }
}
