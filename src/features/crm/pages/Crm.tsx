import { Box, Typography } from "@mui/material";

import { PageHeader } from "../../../components/ui/PageHeader";
import { NeedProject } from "../../../components/ui/NeedProject";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { GLASS_SX } from "../../../constants/layout";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { getDeals, type DealStage } from "../../../services/growth/mockGrowthData";

const stages: { id: DealStage; label: string; tint: string }[] = [
  { id: "new", label: "New", tint: "#FFF4EE" },
  { id: "contacted", label: "Contacted", tint: "#E7F6F4" },
  { id: "meeting", label: "Meeting", tint: "#FFF6E8" },
  { id: "won", label: "Won", tint: "#EAF8EF" },
];

export function CrmPage() {
  const { currentProject } = useWorkspace();
  const deals = getDeals(currentProject?.id ?? "none");

  if (!currentProject) {
    return <NeedProject feature="CRM" />;
  }

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <PageHeader
          eyebrow="Pipeline"
          title="CRM"
          description={`Deals for ${currentProject.name} stay inside this project.`}
        />
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
          }}
        >
          {stages.map((stage) => (
            <Box
              key={stage.id}
              sx={{
                ...GLASS_SX,
                p: 1.5,
                borderRadius: 1,
                backgroundColor: stage.tint,
                minHeight: 280,
              }}
            >
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                {stage.label}
              </Typography>
              {deals
                .filter((deal) => deal.stage === stage.id)
                .map((deal) => (
                  <Box
                    key={deal.id}
                    sx={{
                      mb: 1.2,
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: "#FFFBF7",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
                      {deal.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {deal.company}
                    </Typography>
                    <Typography sx={{ mt: 1, color: "primary.main", fontWeight: 800 }}>
                      {deal.value}
                    </Typography>
                  </Box>
                ))}
            </Box>
          ))}
        </Box>
      </Box>
    </ScreenFrame>
  );
}
