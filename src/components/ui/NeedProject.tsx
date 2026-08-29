import { ScreenFrame } from "./ScreenFrame";
import { PageHeader } from "./PageHeader";

export function NeedProject({ feature }: { feature: string }) {
  return (
    <ScreenFrame>
      <PageHeader
        eyebrow="Workspace"
        title="Select a project first"
        description={`${feature} is scoped to one brand workspace so client data never mixes.`}
      />
    </ScreenFrame>
  );
}
