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

// The step index that unlocks at each checkpoint, in ascending order. A user
// who has hit a given checkpoint may freely navigate any UI step up to (but
// not including) the step that unlocks at the *next* checkpoint -- e.g. once
// brand_structure_selected lands them on company-profile (index 1), they can
// still walk forward through brand-analysis and brand-review (indexes 2-3)
// on their way to the brand_profile_completed checkpoint that unlocks
// products (index 4).
const CHECKPOINT_STEP_INDEXES = [
  onboardingStepIndex(resumeStepForStatus("registered")),
  onboardingStepIndex(resumeStepForStatus("brand_structure_selected")),
  onboardingStepIndex(resumeStepForStatus("brand_profile_completed")),
  onboardingStepIndex(resumeStepForStatus("first_product_created")),
  onboardingStepIndex(resumeStepForStatus("completed")),
];

export function maxReachableStepIndex(step: OnboardingStep | string | undefined): number {
  const resumeIndex = onboardingStepIndex(resumeStepForStatus(step));
  const position = CHECKPOINT_STEP_INDEXES.indexOf(resumeIndex);
  if (position === -1 || position === CHECKPOINT_STEP_INDEXES.length - 1) {
    return resumeIndex;
  }
  const nextIndex = CHECKPOINT_STEP_INDEXES[position + 1];
  const lastStepIndex = ONBOARDING_STEPS.length - 1;
  // "completed" (the final UI step) is the review screen a user lands on
  // *before* the completed checkpoint is recorded -- its own buttons are what
  // call the complete-onboarding endpoint -- so it must stay reachable once
  // the last real checkpoint (first_product_created) is hit, unlike every
  // other boundary where the next step is gated behind a real action.
  return nextIndex === lastStepIndex ? nextIndex : nextIndex - 1;
}
