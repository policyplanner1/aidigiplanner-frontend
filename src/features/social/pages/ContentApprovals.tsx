import { OpenInNew } from "@mui/icons-material";
import { Alert, Box, Button, Chip, TextField, Typography } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { PageHeader } from "../../../components/ui/PageHeader";
import { NeedProject } from "../../../components/ui/NeedProject";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { GLASS_SX } from "../../../constants/layout";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import { getApiErrorMessage } from "../../../services/api/errors";
import {
  addConceptComment,
  approveConcept,
  downloadCreativeAsset,
  listCreativeConcepts,
  primaryAsset,
  rejectConcept,
  type CreativeConcept,
} from "../../../services/content/creativesApi";
import { pushNotification } from "../../../store/notificationStore";

type ApprovalCardProps = {
  concept: CreativeConcept;
  thumbUrl: string | null;
  canApprove: boolean;
  busy: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
  onAct: (type: "approve" | "reject" | "comment") => void;
};

function ApprovalCard({ concept, thumbUrl, canApprove, busy, reason, onReasonChange, onAct }: ApprovalCardProps) {
  return (
    <Box sx={{ ...GLASS_SX, p: 2.25, borderRadius: 1, borderLeft: "6px solid", borderLeftColor: "warning.main" }}>
      <Box sx={{ display: "flex", gap: 1.5 }}>
        {thumbUrl ? (
          <Box
            component="img"
            src={thumbUrl}
            sx={{ width: 96, height: 96, borderRadius: "10px", objectFit: "cover", flexShrink: 0 }}
          />
        ) : null}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "flex-start" }}>
            <Typography variant="caption" color="text.secondary">
              {concept.angle}
            </Typography>
            <StatusBadge status={concept.status} />
          </Box>
          <Typography variant="h6" sx={{ fontSize: 16 }}>
            {concept.on_image_headline || concept.hook}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5, whiteSpace: "pre-wrap", fontSize: 13.5 }}>
            {concept.caption}
          </Typography>
          {concept.compliance_notes?.length ? (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
              {concept.compliance_notes.map((note) => (
                <Chip key={note} label={note} size="small" color="warning" variant="outlined" />
              ))}
            </Box>
          ) : null}
          <Button
            component={RouterLink}
            to={`/app/content/${concept.id}`}
            size="small"
            endIcon={<OpenInNew fontSize="small" />}
            sx={{ mt: 0.5, px: 0 }}
          >
            View details
          </Button>
        </Box>
      </Box>

      {canApprove ? (
        <Box sx={{ display: "grid", gap: 1, mt: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            label="Comment or requested change"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
          />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="contained" disabled={busy} onClick={() => onAct("approve")}>
              Approve
            </Button>
            <Button disabled={busy} onClick={() => onAct("reject")}>
              Request changes
            </Button>
            <Button disabled={busy} onClick={() => onAct("comment")}>
              Add comment
            </Button>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

export function ContentApprovalsPage() {
  const { currentProject } = useWorkspace();
  const { can } = usePermissions();
  const canApprove = can(PERMISSIONS.CONTENT_APPROVE);
  const queryClient = useQueryClient();
  const [reason, setReason] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  const queue = useQuery({
    queryKey: ["creative-approvals", currentProject?.id],
    queryFn: async () => {
      const { data } = await listCreativeConcepts(currentProject?.id as string, undefined, "in_review");
      return Array.isArray(data) ? data : [];
    },
    enabled: Boolean(currentProject?.id),
    retry: false,
  });

  useEffect(() => {
    if (!currentProject || !queue.data) return;
    let cancelled = false;
    queue.data.forEach((concept) => {
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
  }, [currentProject, queue.data]);

  if (!currentProject) {
    return <NeedProject feature="Approvals" />;
  }

  const act = async (concept: CreativeConcept, type: "approve" | "reject" | "comment") => {
    setBusyId(concept.id);
    setNotice(null);
    setOk(false);
    try {
      if (type === "approve") {
        await approveConcept(currentProject.id, concept.id);
        pushNotification({
          type: "content_approved",
          title: "Content approved",
          detail: concept.on_image_headline || concept.angle,
          path: `/app/content/${concept.id}`,
        });
      }
      if (type === "reject") {
        const text = reason[concept.id]?.trim();
        if (!text) throw new Error("Add a reason so the creator knows what to change.");
        await rejectConcept(currentProject.id, concept.id, text);
        pushNotification({
          type: "changes_requested",
          title: "Changes requested",
          detail: concept.on_image_headline || concept.angle,
          path: `/app/content/${concept.id}`,
        });
      }
      if (type === "comment") {
        const text = reason[concept.id]?.trim();
        if (!text) throw new Error("Write a comment first.");
        await addConceptComment(currentProject.id, concept.id, text);
      }
      setOk(true);
      setNotice(type === "approve" ? "Approved." : type === "reject" ? "Changes requested." : "Comment added.");
      await queryClient.invalidateQueries({ queryKey: ["creative-approvals", currentProject.id] });
    } catch (error) {
      setNotice(getApiErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5, maxWidth: 760 }}>
        <PageHeader
          eyebrow="Review queue"
          title="Approvals"
          description={`Draft → In review → Approved → Scheduled → Published for ${currentProject.name}.`}
        />
        {notice ? <Alert severity={ok ? "success" : "error"}>{notice}</Alert> : null}

        {queue.isLoading ? <Typography color="text.secondary">Loading…</Typography> : null}
        {queue.isError ? <Alert severity="error">{getApiErrorMessage(queue.error)}</Alert> : null}

        {!queue.isLoading && (queue.data?.length ?? 0) === 0 ? (
          <Box sx={{ ...GLASS_SX, p: 3, borderRadius: 1, maxWidth: 480 }}>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Nothing waiting for review.</Typography>
            <Typography color="text.secondary" sx={{ fontSize: 13.5 }}>
              Content sent for approval from {currentProject.name} will show up here.
            </Typography>
          </Box>
        ) : null}

        <Box sx={{ display: "grid", gap: 1.5 }}>
          {(queue.data ?? []).map((concept) => (
            <ApprovalCard
              key={concept.id}
              concept={concept}
              thumbUrl={thumbs[concept.id] ?? null}
              canApprove={canApprove}
              busy={busyId === concept.id}
              reason={reason[concept.id] ?? ""}
              onReasonChange={(value) => setReason((current) => ({ ...current, [concept.id]: value }))}
              onAct={(type) => void act(concept, type)}
            />
          ))}
        </Box>
      </Box>
    </ScreenFrame>
  );
}
