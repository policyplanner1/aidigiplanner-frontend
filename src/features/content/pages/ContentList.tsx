import { AutoAwesome, PlayCircleOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Chip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { CapsuleFilter } from "../../../components/ui/CapsuleFilter";
import { NeedProject } from "../../../components/ui/NeedProject";
import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { GLASS_SX, SURFACE } from "../../../constants/layout";
import { getContentFormat } from "../../../constants/contentFormats";
import { CONTENT_FORMAT_ICONS, inferConceptFormat } from "../../../constants/contentFormatIcons";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import { getApiErrorMessage } from "../../../services/api/errors";
import {
  downloadCreativeAsset,
  listCreativeConcepts,
  primaryAsset,
  type CreativeConcept,
} from "../../../services/content/creativesApi";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "in_review", label: "In Review" },
  { id: "approved", label: "Approved" },
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Published" },
  { id: "rejected", label: "Changes Requested" },
] as const;

export function ContentListPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { currentProject } = useWorkspace();
  const { can } = usePermissions();
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]["id"]>("all");
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const live = session?.source === "api";

  const query = useQuery({
    queryKey: ["creative-concepts", currentProject?.id, status],
    queryFn: () =>
      listCreativeConcepts(currentProject!.id, undefined, status === "all" ? undefined : status).then(
        (res) => res.data,
      ),
    enabled: live && Boolean(currentProject?.id),
  });

  useEffect(() => {
    if (!currentProject || !query.data) return;
    let cancelled = false;
    query.data.forEach((concept) => {
      const asset = primaryAsset(concept);
      if (!asset || thumbs[concept.id]) return;
      downloadCreativeAsset(currentProject.id, asset.id).then((url) => {
        if (!cancelled) setThumbs((current) => ({ ...current, [concept.id]: url }));
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject, query.data]);

  if (!currentProject) {
    return <NeedProject feature="Content" />;
  }

  const concepts = [...(query.data ?? [])].sort((a, b) => b.concept_index - a.concept_index);

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <PageHeader
          eyebrow={currentProject.name}
          title="Content"
          description="Every piece generated for this product, across every status."
          action={
            can(PERMISSIONS.CONTENT_CREATE) ? (
              <Button variant="contained" startIcon={<AutoAwesome />} onClick={() => navigate("/app/create")}>
                Create with AI
              </Button>
            ) : null
          }
        />

        <CapsuleFilter items={STATUS_FILTERS} value={status} onChange={setStatus} />

        {query.isError ? <Alert severity="error">{getApiErrorMessage(query.error)}</Alert> : null}

        {query.isLoading ? (
          <Typography color="text.secondary">Loading content…</Typography>
        ) : concepts.length === 0 ? (
          <Box sx={{ ...GLASS_SX, p: 3, borderRadius: 1, maxWidth: 480 }}>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>No content yet.</Typography>
            <Typography color="text.secondary" sx={{ mb: 1.5 }}>
              Create your first AI-powered post.
            </Typography>
            <Button variant="contained" onClick={() => navigate("/app/create")}>
              Create Content
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
            }}
          >
            {concepts.map((concept) => (
              <ContentCard
                key={concept.id}
                concept={concept}
                thumbUrl={thumbs[concept.id] ?? null}
                onOpen={() => navigate(`/app/content/${concept.id}`)}
              />
            ))}
          </Box>
        )}
      </Box>
    </ScreenFrame>
  );
}

function ContentCard({
  concept,
  thumbUrl,
  onOpen,
}: {
  concept: CreativeConcept;
  thumbUrl: string | null;
  onOpen: () => void;
}) {
  const hasVideo = concept.assets?.some((asset) => asset.kind === "video");
  const format = inferConceptFormat(concept);
  const FormatIcon = CONTENT_FORMAT_ICONS[format];
  return (
    <Box
      onClick={onOpen}
      sx={{
        ...GLASS_SX,
        p: 2,
        borderRadius: 1,
        cursor: "pointer",
        display: "grid",
        gap: 1,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: "0 10px 22px rgba(74,52,44,0.1)" },
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: 120,
          borderRadius: "10px",
          background: thumbUrl ? undefined : `linear-gradient(135deg, ${SURFACE.heroFrom}, ${SURFACE.heroTo})`,
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
        }}
      >
        {thumbUrl && hasVideo ? (
          <Box
            component="video"
            src={thumbUrl}
            muted
            playsInline
            preload="metadata"
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : thumbUrl ? (
          <Box component="img" src={thumbUrl} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : hasVideo ? (
          <PlayCircleOutlined sx={{ fontSize: 32, color: "#fff" }} />
        ) : null}
        {thumbUrl && hasVideo ? (
          <PlayCircleOutlined
            sx={{
              position: "absolute",
              fontSize: 32,
              color: "#fff",
              filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.6))",
            }}
          />
        ) : null}
        <Chip
          size="small"
          icon={<FormatIcon fontSize="small" />}
          label={getContentFormat(format).label}
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            backgroundColor: "rgba(255,255,255,0.9)",
            fontWeight: 700,
          }}
        />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>
          {concept.on_image_headline || concept.angle || `Concept ${concept.concept_index + 1}`}
        </Typography>
        <StatusBadge status={concept.status} />
      </Box>
      <Typography color="text.secondary" sx={{ fontSize: 13 }} noWrap>
        {concept.caption || concept.hook}
      </Typography>
    </Box>
  );
}
