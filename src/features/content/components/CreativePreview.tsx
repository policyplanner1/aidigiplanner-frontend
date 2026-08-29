import { Box, Button, Chip, CircularProgress, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { TYPE } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";
import {
  downloadCreativeAsset,
  formatInr,
  formatReelScript,
  jobStatusLabel,
  primaryAsset,
  versionLabel,
  type CreativeConcept,
  type GenerationJob,
} from "../../../services/content/creativesApi";
import { STAGE_GLASS } from "./StudioFlow";

type CreativePreviewProps = {
  projectId: string;
  job: GenerationJob | null;
  concepts: CreativeConcept[];
  generating: boolean;
  error: string | null;
  emptyHint: string;
  onRetry?: (hint: string) => void;
  onSelect?: (concept: CreativeConcept) => void;
};

export function CreativePreview({
  projectId,
  job,
  concepts,
  generating,
  error,
  emptyHint,
  onRetry,
  onSelect,
}: CreativePreviewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(concepts[0]?.id ?? null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");

  const selected = useMemo(
    () => concepts.find((item) => item.id === selectedId) ?? concepts[0] ?? null,
    [concepts, selectedId],
  );
  const asset = primaryAsset(selected);

  useEffect(() => {
    setSelectedId(concepts[0]?.id ?? null);
    setEditing(false);
  }, [concepts]);

  useEffect(() => {
    if (!selected) return;
    setCaption(selected.caption);
    setHashtags(selected.hashtags.join(" "));
    onSelect?.(selected);
  }, [onSelect, selected]);

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;

    const load = async () => {
      if (!asset) {
        setImageUrl(null);
        return;
      }
      setImageBusy(true);
      try {
        const url = await downloadCreativeAsset(projectId, asset.id);
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        revoked = url;
        setImageUrl(url);
      } catch {
        if (!cancelled) setImageUrl(null);
      } finally {
        if (!cancelled) setImageBusy(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [asset, projectId]);

  return (
    <Box
      sx={{
        ...STAGE_GLASS,
        p: 3,
        minHeight: 420,
        borderRadius: "20px",
        display: "grid",
        alignContent: "start",
        gap: 1.5,
        background: "linear-gradient(180deg, rgba(255,107,69,0.10) 0%, rgba(246,238,230,0.48) 42%, rgba(31,138,128,0.10) 100%)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
        <Typography variant="caption" sx={{ color: "secondary.dark", fontWeight: 800 }}>
          REVIEW AND CUSTOMIZE
        </Typography>
        {job ? (
          <Chip
            size="small"
            label={jobStatusLabel(job.status)}
            color={
              job.status === "failed"
                ? "error"
                : job.status === "succeeded"
                  ? "success"
                  : job.status === "awaiting_render"
                    ? "warning"
                    : "default"
            }
          />
        ) : null}
      </Box>

      {generating ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, py: 1 }}>
          <CircularProgress size={18} />
          <Typography sx={{ fontWeight: 700 }}>
            {job ? jobStatusLabel(job.status) : "Starting generation…"}
          </Typography>
        </Box>
      ) : null}

      {error ? (
        <Typography color="error" sx={{ fontSize: 14 }}>
          {error}
        </Typography>
      ) : null}

      {concepts.length ? (
        <Box sx={{ display: "grid", gap: 0.75 }}>
          {concepts.map((item, index) => {
            const active = item.id === selected?.id;
            return (
              <Box
                key={item.id}
                component="button"
                type="button"
                onClick={() => setSelectedId(item.id)}
                sx={{
                  appearance: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  borderRadius: "14px",
                  px: 1.4,
                  py: 1.1,
                  border: "1px solid",
                  borderColor: active ? "#FF6B45" : SURFACE.border,
                  backgroundColor: active ? "rgba(255,107,69,0.12)" : "rgba(246,238,230,0.45)",
                }}
              >
                <Typography sx={{ ...TYPE.eyebrow, color: active ? "primary.main" : "text.secondary" }}>
                  Version {index + 1}: {versionLabel(index)}
                </Typography>
                <Typography sx={{ fontWeight: 700, mt: 0.35, fontSize: 14 }}>
                  {item.on_image_headline || item.hook}
                </Typography>
              </Box>
            );
          })}
        </Box>
      ) : !generating && !error ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          {emptyHint}
        </Typography>
      ) : null}

      {selected ? (
        <>
          <Box
            sx={{
              borderRadius: "16px",
              overflow: "hidden",
              minHeight: 220,
              display: "grid",
              placeItems: "center",
              backgroundColor: "rgba(246,238,230,0.55)",
              border: `1px solid ${SURFACE.border}`,
            }}
          >
            {imageBusy ? (
              <CircularProgress size={22} />
            ) : imageUrl && (asset?.kind === "video" || asset?.mime_type?.startsWith("video")) ? (
              <Box
                component="video"
                src={imageUrl}
                controls
                sx={{ width: "100%", display: "block", maxHeight: 420 }}
              />
            ) : imageUrl ? (
              <Box
                component="img"
                src={imageUrl}
                alt={selected.on_image_headline}
                sx={{ width: "100%", display: "block", maxHeight: 420, objectFit: "cover" }}
              />
            ) : (
              <Typography color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
                {job?.status === "awaiting_render"
                  ? "Video is not rendered yet. Review the script, then tap Render video."
                  : asset
                    ? "Media is not ready yet."
                    : selected.on_image_kicker || "No image for this concept."}
              </Typography>
            )}
          </Box>

          <Typography variant="h5">{selected.on_image_headline}</Typography>
          {selected.on_image_subhead ? (
            <Typography color="text.secondary">{selected.on_image_subhead}</Typography>
          ) : null}
          {editing ? (
            <>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Caption"
                placeholder="A short caption for your audience."
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
              />
              <TextField
                fullWidth
                label="Hashtags"
                placeholder="#healthinsurance #familycover"
                value={hashtags}
                onChange={(event) => setHashtags(event.target.value)}
              />
            </>
          ) : (
            <>
              <Typography sx={{ color: "primary.main", fontWeight: 700 }}>{selected.hook}</Typography>
              <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: 15 }}>{selected.caption}</Typography>
              {selected.hashtags.length ? (
                <Typography color="secondary.dark" sx={{ fontWeight: 600 }}>
                  {selected.hashtags.join(" ")}
                </Typography>
              ) : null}
            </>
          )}
          <Typography variant="body2">CTA: {selected.cta}</Typography>
          {formatReelScript(selected.reel_script) ? (
            <Box sx={{ p: 1.5, borderRadius: "14px", backgroundColor: "rgba(246,238,230,0.55)", border: `1px solid ${SURFACE.border}` }}>
              <Typography sx={{ ...TYPE.eyebrow, color: "text.secondary", mb: 0.75 }}>Reel script</Typography>
              <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7, fontSize: 14 }}>
                {formatReelScript(selected.reel_script)}
              </Typography>
            </Box>
          ) : null}
          {selected.disclaimer_line ? (
            <Typography variant="caption" color="text.secondary">
              {selected.disclaimer_line}
            </Typography>
          ) : null}
          {selected.compliance_notes?.length ? (
            <Typography variant="caption" color="warning.main">
              Branding or compliance note: {selected.compliance_notes.join(" ")}
            </Typography>
          ) : null}

          {onRetry ? (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button size="small" onClick={() => onRetry("Make the caption and on-image text shorter.")}>
                Make shorter
              </Button>
              <Button size="small" onClick={() => onRetry("Change the tone while keeping the same topic.")}>
                Change tone
              </Button>
              <Button size="small" onClick={() => onRetry("Try another creative angle.")}>
                Try another
              </Button>
              <Button size="small" onClick={() => onRetry("Translate this content to Hindi.")}>
                Translate
              </Button>
              <Button size="small" onClick={() => onRetry("Use a different image concept for the same topic.")}>
                Change image
              </Button>
              <Button size="small" onClick={() => setEditing((open) => !open)}>
                {editing ? "Done editing" : "Edit manually"}
              </Button>
            </Box>
          ) : null}
        </>
      ) : null}

      <Box
        sx={{
          mt: "auto",
          pt: 1.5,
          display: "grid",
          gap: 0.75,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          borderTop: `1px solid ${SURFACE.border}`,
        }}
      >
        <CostTile
          label="This image"
          value={formatInr(asset?.actual_cost_inr ?? asset?.estimated_cost_inr)}
          hint={asset?.actual_cost_inr != null ? "Actual" : "Estimated"}
        />
        <CostTile
          label="This job"
          value={formatInr(job?.actual_cost_inr ?? job?.estimated_cost_inr)}
          hint={job?.actual_cost_inr != null ? "Actual" : "Estimated"}
        />
      </Box>
    </Box>
  );
}

function CostTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Box sx={{ p: 1.25, borderRadius: "14px", backgroundColor: "rgba(246,238,230,0.55)", border: `1px solid ${SURFACE.border}` }}>
      <Typography sx={{ ...TYPE.eyebrow, color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ fontWeight: 800, fontSize: 18, mt: 0.35 }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">
        {hint}
      </Typography>
    </Box>
  );
}
