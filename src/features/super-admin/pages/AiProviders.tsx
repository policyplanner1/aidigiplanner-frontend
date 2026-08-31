import { CheckCircle, RadioButtonUnchecked } from "@mui/icons-material";
import { Alert, Box, Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";

// Reflects the real provider abstraction in aidigiplanner-backend
// (app/modules/creatives/providers/*.py — a swappable LLMProvider/ImageProvider/
// VideoProvider ABC with a real Gemini implementation and a deterministic mock).
// There's no admin API to reconfigure priority/fallback yet, so this is a status
// view, not an editable settings page.
const PROVIDERS = [
  {
    id: "gemini",
    name: "Google Gemini",
    kinds: "Text, image, video",
    status: "active" as const,
    detail: "Configured via GEMINI_API_KEY. Falls back to a deterministic mock provider when dry_run is set or no key is configured.",
  },
  {
    id: "openai",
    name: "OpenAI",
    kinds: "Text, image",
    status: "not_configured" as const,
    detail: "Not implemented yet — the provider interface (LLMProvider/ImageProvider) is ready for a second implementation.",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    kinds: "Text",
    status: "not_configured" as const,
    detail: "Not implemented yet.",
  },
];

export function AiProvidersPage() {
  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <PageHeader
          eyebrow="Platform"
          title="AI Providers"
          description="Providers available to the creative-generation pipeline, and their fallback order."
        />

        <Alert severity="info">
          Priority and fallback configuration isn't exposed through an admin API yet — Gemini
          is the only real provider today; this page reflects the code as it stands.
        </Alert>

        <Paper sx={{ borderRadius: 1, overflow: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Priority</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Capabilities</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {PROVIDERS.map((provider, index) => (
                <TableRow key={provider.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{provider.name}</TableCell>
                  <TableCell>{provider.kinds}</TableCell>
                  <TableCell>
                    {provider.status === "active" ? (
                      <Chip size="small" color="success" icon={<CheckCircle />} label="Active" />
                    ) : (
                      <Chip size="small" icon={<RadioButtonUnchecked />} label="Not configured" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {provider.detail}
                    </Typography>
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
