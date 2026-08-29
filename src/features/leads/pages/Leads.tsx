import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import { PageHeader } from "../../../components/ui/PageHeader";
import { NeedProject } from "../../../components/ui/NeedProject";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { getLeads } from "../../../services/growth/mockGrowthData";

const colors: Record<string, "default" | "success" | "warning" | "info"> = {
  new: "default",
  qualified: "success",
  contacted: "info",
  lost: "warning",
};

export function LeadsPage() {
  const { currentProject } = useWorkspace();
  const leads = getLeads(currentProject?.id ?? "none");

  if (!currentProject) {
    return <NeedProject feature="Leads" />;
  }

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <PageHeader
          eyebrow="Demand"
          title="Leads"
          description={`Qualified demand for ${currentProject.name}. Scoring is mocked until enrichment is live.`}
        />
        <Paper sx={{ overflow: "auto", borderRadius: 1 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id} hover>
                  <TableCell sx={{ fontWeight: 600, fontSize: 16 }}>
                    {lead.name}
                  </TableCell>
                  <TableCell>{lead.company}</TableCell>
                  <TableCell>{lead.title}</TableCell>
                  <TableCell>{lead.source}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "primary.main" }}>{lead.score}</TableCell>
                  <TableCell>
                    <Chip size="small" color={colors[lead.status]} label={lead.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </ScreenFrame>
  );
}
