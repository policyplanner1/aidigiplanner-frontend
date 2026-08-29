import { AutoAwesome, Policy, Search, VerifiedUser } from "@mui/icons-material";
import { Box, Chip, Typography } from "@mui/material";

import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { GLASS_SX } from "../../../constants/layout";
import { useWorkspace } from "../../../hooks/useWorkspace";

const agents = [
  {
    title: "Content Agent",
    body: "Turns the brand kit into weekly captions and campaign drafts.",
    icon: <AutoAwesome />,
    status: "Active",
  },
  {
    title: "Research Agent",
    body: "Researches companies, trends, and competitor social activity.",
    icon: <Search />,
    status: "Active",
  },
  {
    title: "Compliance Agent",
    body: "Blocks banned claims before anything is scheduled.",
    icon: <Policy />,
    status: "Guarding",
  },
  {
    title: "Lead Agent",
    body: "Scores leads and drafts personalized first-touch emails.",
    icon: <VerifiedUser />,
    status: "Queued",
  },
];

export function AgentsPage() {
  const { currentProject } = useWorkspace();

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <PageHeader
          eyebrow="Workforce"
          title="AI Agents"
          description={
            currentProject
              ? `Specialists for ${currentProject.name}. Runs will connect to NestJS queues next.`
              : "Select a project to scope agents."
          }
        />
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          {agents.map((agent) => (
            <Box
              key={agent.title}
              sx={{
                ...GLASS_SX,
                p: 3,
                borderRadius: 1,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "primary.main" }}>
                  {agent.icon}
                  <Typography variant="h6">{agent.title}</Typography>
                </Box>
                <Chip size="small" color="success" label={agent.status} />
              </Box>
              <Typography color="text.secondary">{agent.body}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </ScreenFrame>
  );
}
