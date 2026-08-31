import { Add, Delete } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { GLASS_SX } from "../../../constants/layout";
import { CONTENT_FORMATS, getContentFormat, type ContentFormatId } from "../../../constants/contentFormats";
import { deleteTemplate, listTemplates, saveTemplate, type SystemTemplate } from "../../../services/admin/templateStore";

export function TemplatesPage() {
  const [tick, setTick] = useState(0);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [format, setFormat] = useState<ContentFormatId>("post");
  const [industry, setIndustry] = useState("General");
  const [prompt, setPrompt] = useState("");
  void tick;

  const templates = listTemplates();

  const create = () => {
    if (!name.trim() || !prompt.trim()) return;
    saveTemplate({ name: name.trim(), format: format as SystemTemplate["format"], industry: industry.trim() || "General", prompt: prompt.trim(), active: true });
    setOpen(false);
    setName("");
    setPrompt("");
    setTick((value) => value + 1);
  };

  const toggleActive = (template: SystemTemplate) => {
    saveTemplate({ ...template, active: !template.active });
    setTick((value) => value + 1);
  };

  const remove = (id: string) => {
    deleteTemplate(id);
    setTick((value) => value + 1);
  };

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <PageHeader
          eyebrow="Platform"
          title="Templates"
          description="Starting prompts every company can pick from when creating with AI."
          action={
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
              New template
            </Button>
          }
        />

        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          {templates.map((template) => (
            <Box key={template.id} sx={{ ...GLASS_SX, p: 2, borderRadius: 1, opacity: template.active ? 1 : 0.55 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>{template.name}</Typography>
                <Chip size="small" label={getContentFormat(template.format).label} />
              </Box>
              <Typography variant="caption" color="text.secondary">{template.industry}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, fontSize: 13.5 }}>{template.prompt}</Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                <Button size="small" onClick={() => toggleActive(template)}>
                  {template.active ? "Deactivate" : "Activate"}
                </Button>
                <Button size="small" color="error" startIcon={<Delete fontSize="small" />} onClick={() => remove(template.id)}>
                  Delete
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New template</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 0.5 }}>
          <TextField label="Name" fullWidth margin="normal" value={name} onChange={(event) => setName(event.target.value)} />
          <TextField select label="Format" fullWidth margin="normal" value={format} onChange={(event) => setFormat(event.target.value as ContentFormatId)}>
            {CONTENT_FORMATS.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Industry" fullWidth margin="normal" value={industry} onChange={(event) => setIndustry(event.target.value)} />
          <TextField label="Prompt" fullWidth margin="normal" multiline minRows={3} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={create}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </ScreenFrame>
  );
}
