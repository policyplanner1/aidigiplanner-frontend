import { Alert, Box, Button, Chip, TextField, Typography } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { PageHeader } from "../../../components/ui/PageHeader";
import { NeedProject } from "../../../components/ui/NeedProject";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { GLASS_SX } from "../../../constants/layout";
import { getContentFormat } from "../../../constants/contentFormats";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import { getApiErrorMessage } from "../../../services/api/errors";
import {
  addConceptComment,
  approveConcept,
  listCreativeConcepts,
  rejectConcept,
  type CreativeConcept,
} from "../../../services/content/creativesApi";
import {
  getSocialPosts,
  statusChipColor,
  updatePostStatus,
} from "../../../services/social/publishingService";

export function ContentApprovalsPage() {
  const { currentProject } = useWorkspace();
  const { session } = useAuth();
  const { can } = usePermissions();
  const canApprove = can(PERMISSIONS.CONTENT_APPROVE);
  const live = session?.source === "api";
  const queryClient = useQueryClient();
  const [reason, setReason] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const liveQueue = useQuery({
    queryKey: ["creative-approvals", currentProject?.id],
    queryFn: async () => {
      const { data } = await listCreativeConcepts(currentProject?.id as string, undefined, "in_review");
      return Array.isArray(data) ? data : [];
    },
    enabled: live && Boolean(currentProject?.id),
    retry: false,
  });

  const posts = getSocialPosts(currentProject?.id ?? "none").filter(
    (item) => item.status === "in_review" || item.status === "approved" || item.status === "rejected",
  );

  if (!currentProject) {
    return <NeedProject feature="Approvals" />;
  }

  const act = async (concept: CreativeConcept, type: "approve" | "reject" | "comment") => {
    setBusyId(concept.id);
    setNotice(null);
    setOk(false);
    try {
      if (type === "approve") await approveConcept(currentProject.id, concept.id);
      if (type === "reject") {
        const text = reason[concept.id]?.trim();
        if (!text) throw new Error("Add a reason so the creator knows what to change.");
        await rejectConcept(currentProject.id, concept.id, text);
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

        {live && (liveQueue.data?.length ?? 0) > 0 ? (
          <Box sx={{ display: "grid", gap: 1.5 }}>
            {liveQueue.data?.map((concept) => (
              <Box key={concept.id} sx={{ ...GLASS_SX, p: 2.25, borderRadius: 1, borderLeft: "6px solid", borderLeftColor: "warning.main" }}>
                <Typography variant="caption" color="text.secondary">
                  {concept.angle} · in review
                </Typography>
                <Typography variant="h6">{concept.on_image_headline || concept.hook}</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
                  {concept.caption}
                </Typography>
                {canApprove ? (
                  <Box sx={{ display: "grid", gap: 1, mt: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Comment or requested change"
                      value={reason[concept.id] ?? ""}
                      onChange={(event) => setReason((current) => ({ ...current, [concept.id]: event.target.value }))}
                    />
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button variant="contained" disabled={busyId === concept.id} onClick={() => void act(concept, "approve")}>
                        Approve
                      </Button>
                      <Button disabled={busyId === concept.id} onClick={() => void act(concept, "reject")}>
                        Request changes
                      </Button>
                      <Button disabled={busyId === concept.id} onClick={() => void act(concept, "comment")}>
                        Add comment
                      </Button>
                    </Box>
                  </Box>
                ) : null}
              </Box>
            ))}
          </Box>
        ) : null}

        {!live && posts.length === 0 ? (
          <Typography color="text.secondary">Nothing waiting for review.</Typography>
        ) : null}
        {live && !liveQueue.data?.length && !liveQueue.isLoading ? (
          <Typography color="text.secondary">Nothing waiting for review.</Typography>
        ) : null}

        {!live && posts.length > 0 ? (
          <Box sx={{ display: "grid", gap: 1.5 }}>
            {posts.map((post) => (
              <Box
                key={post.id}
                sx={{
                  ...GLASS_SX,
                  p: 2.25,
                  borderRadius: 1,
                  borderLeft: "6px solid",
                  borderLeftColor:
                    post.status === "in_review" ? "warning.main" : post.status === "approved" ? "success.main" : "error.main",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {getContentFormat(post.format).label} · {post.platform} · {post.day} {post.time}
                    </Typography>
                    <Typography variant="h6">{post.title}</Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                      {post.caption}
                    </Typography>
                  </Box>
                  <Chip color={statusChipColor(post.status)} label={post.status.replace("_", " ")} />
                </Box>
                {canApprove && post.status === "in_review" ? (
                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Button variant="contained" onClick={() => updatePostStatus(post.id, "approved")}>
                      Approve
                    </Button>
                    <Button onClick={() => updatePostStatus(post.id, "rejected")}>Request changes</Button>
                  </Box>
                ) : null}
              </Box>
            ))}
          </Box>
        ) : null}
      </Box>
    </ScreenFrame>
  );
}
