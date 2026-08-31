import { ArrowBack } from "@mui/icons-material";
import { Alert, Box, Button, Chip, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "../../../components/ui/PageHeader";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { GLASS_SX, SURFACE } from "../../../constants/layout";
import { usePermissions } from "../../../hooks/usePermissions";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { PERMISSIONS } from "../../../permissions/permissions";
import { getApiErrorMessage } from "../../../services/api/errors";
import { pushNotification, type NotificationType } from "../../../store/notificationStore";
import {
  addConceptComment,
  approveAndPublishConcept,
  approveConcept,
  downloadCreativeAsset,
  formatReelScript,
  getCreativeConcept,
  listConceptComments,
  primaryAsset,
  publishConcept,
  rejectConcept,
  scheduleConcept,
  submitConceptForReview,
} from "../../../services/content/creativesApi";

export function ContentEditorPage() {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const { currentProject } = useWorkspace();
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const [assetUrl, setAssetUrl] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const productId = currentProject?.id ?? "";

  const conceptQuery = useQuery({
    queryKey: ["creative-concept", productId, contentId],
    queryFn: () => getCreativeConcept(productId, contentId as string).then((res) => res.data),
    enabled: Boolean(productId && contentId),
  });

  const commentsQuery = useQuery({
    queryKey: ["creative-concept-comments", productId, contentId],
    queryFn: () => listConceptComments(productId, contentId as string).then((res) => res.data),
    enabled: Boolean(productId && contentId),
  });

  const concept = conceptQuery.data;
  const asset = concept ? primaryAsset(concept) : null;

  useEffect(() => {
    if (!asset || !productId) return;
    let cancelled = false;
    downloadCreativeAsset(productId, asset.id).then((url) => {
      if (!cancelled) setAssetUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [asset, productId]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["creative-concept", productId, contentId] });
    queryClient.invalidateQueries({ queryKey: ["creative-concepts", productId] });
  };

  const runAction = async (
    action: () => Promise<unknown>,
    notify?: { type: NotificationType; title: string },
  ) => {
    setActionError(null);
    try {
      await action();
      invalidate();
      if (notify) {
        pushNotification({ ...notify, detail: concept?.on_image_headline || concept?.angle, path: `/app/content/${contentId}` });
      }
    } catch (err) {
      const message = getApiErrorMessage(err);
      setActionError(message);
      if (notify?.type === "content_published") {
        pushNotification({
          type: "publishing_failed",
          title: "Publishing failed",
          detail: message,
          path: `/app/content/${contentId}`,
        });
      }
    }
  };

  const commentMutation = useMutation({
    mutationFn: (body: string) => addConceptComment(productId, contentId as string, body),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["creative-concept-comments", productId, contentId] });
    },
  });

  if (!currentProject) {
    return <Navigate to="/app/content" replace />;
  }

  if (conceptQuery.isLoading) {
    return (
      <ScreenFrame>
        <Typography color="text.secondary">Loading…</Typography>
      </ScreenFrame>
    );
  }

  if (conceptQuery.isError || !concept) {
    return (
      <ScreenFrame>
        <Alert severity="error">{conceptQuery.error ? getApiErrorMessage(conceptQuery.error) : "Content not found."}</Alert>
      </ScreenFrame>
    );
  }

  const status = (concept.status ?? "draft") as string;
  const canApprove = can(PERMISSIONS.CONTENT_APPROVE);
  const canPublish = can(PERMISSIONS.CONTENT_PUBLISH);
  const canEdit = can(PERMISSIONS.CONTENT_CREATE) || can(PERMISSIONS.CONTENT_EDIT);

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2.5 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/app/content")} sx={{ justifySelf: "start" }}>
          Back to content
        </Button>

        <PageHeader
          eyebrow={currentProject.name}
          title={concept.on_image_headline || concept.angle || "Content"}
          description={concept.hook}
          action={<StatusBadge status={status} size="medium" />}
        />

        {actionError ? <Alert severity="error">{actionError}</Alert> : null}

        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" } }}>
          <Box sx={{ display: "grid", gap: 1.5 }}>
            {assetUrl ? (
              asset?.kind === "video" ? (
                <Box component="video" src={assetUrl} controls sx={{ width: "100%", borderRadius: "12px", maxHeight: 420 }} />
              ) : (
                <Box component="img" src={assetUrl} sx={{ width: "100%", borderRadius: "12px", maxHeight: 420, objectFit: "cover" }} />
              )
            ) : null}

            <Box sx={{ ...GLASS_SX, p: 2, borderRadius: 1, display: "grid", gap: 1 }}>
              <Field label="Caption" value={concept.caption} />
              <Field label="Hashtags" value={concept.hashtags?.join(" ")} />
              <Field label="CTA" value={concept.cta} />
              {concept.reel_script ? <Field label="Script" value={formatReelScript(concept.reel_script)} multiline /> : null}
              {concept.carousel_slides?.length ? (
                <Field
                  label="Slides"
                  value={concept.carousel_slides
                    .map((slide, index) => `Slide ${index + 1}: ${String(slide.title ?? slide.headline ?? slide.text ?? "")}`)
                    .join("\n")}
                  multiline
                />
              ) : null}
              {concept.disclaimer_line ? <Field label="Disclaimer" value={concept.disclaimer_line} /> : null}
              {concept.compliance_notes?.length ? (
                <Box>
                  <Typography variant="caption" color="text.secondary">Compliance notes</Typography>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
                    {concept.compliance_notes.map((note) => (
                      <Chip key={note} label={note} size="small" color="warning" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              ) : null}
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {status === "draft" && canEdit ? (
                <Button
                  variant="contained"
                  onClick={() =>
                    void runAction(() => submitConceptForReview(productId, concept.id), {
                      type: "content_submitted",
                      title: "Content submitted for approval",
                    })
                  }
                >
                  Send for Approval
                </Button>
              ) : null}

              {status === "in_review" && canApprove ? (
                <>
                  <Button
                    variant="contained"
                    onClick={() =>
                      void runAction(
                        () =>
                          canPublish ? approveAndPublishConcept(productId, concept.id) : approveConcept(productId, concept.id),
                        canPublish
                          ? { type: "content_published", title: "Content approved and published" }
                          : { type: "content_approved", title: "Content approved" },
                      )
                    }
                  >
                    {canPublish ? "Approve & Publish" : "Approve"}
                  </Button>
                  {canPublish ? (
                    <Button
                      variant="outlined"
                      onClick={() =>
                        void runAction(() => approveConcept(productId, concept.id), {
                          type: "content_approved",
                          title: "Content approved",
                        })
                      }
                    >
                      Approve Only
                    </Button>
                  ) : null}
                  <Button variant="outlined" color="error" onClick={() => setShowReject((open) => !open)}>
                    Request Changes
                  </Button>
                </>
              ) : null}

              {status === "approved" && canPublish ? (
                <>
                  <Button
                    variant="contained"
                    onClick={() =>
                      void runAction(() => publishConcept(productId, concept.id), {
                        type: "content_published",
                        title: "Content published",
                      })
                    }
                  >
                    Publish Now
                  </Button>
                  <Button variant="outlined" onClick={() => setShowSchedule((open) => !open)}>
                    Schedule
                  </Button>
                  {concept.suggested_posting_time ? (
                    <Button
                      variant="outlined"
                      onClick={() =>
                        void runAction(
                          () => scheduleConcept(productId, concept.id, { use_suggested_time: true }),
                          { type: "content_scheduled", title: "Content scheduled" },
                        )
                      }
                    >
                      Let AI choose the best time
                    </Button>
                  ) : null}
                </>
              ) : null}
            </Box>

            {status === "approved" && concept.suggested_posting_time ? (
              <Typography variant="caption" color="text.secondary">
                AI suggests posting at {new Date(concept.suggested_posting_time).toLocaleString()}.
              </Typography>
            ) : null}

            {showReject ? (
              <Box sx={{ display: "grid", gap: 1 }}>
                <TextField
                  label="Reason for requesting changes"
                  fullWidth
                  multiline
                  minRows={2}
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                />
                <Button
                  variant="contained"
                  color="error"
                  disabled={!rejectReason.trim()}
                  sx={{ width: "fit-content" }}
                  onClick={() =>
                    void runAction(() => rejectConcept(productId, concept.id, rejectReason.trim()), {
                      type: "changes_requested",
                      title: "Changes requested",
                    }).then(() => {
                      setShowReject(false);
                      setRejectReason("");
                    })
                  }
                >
                  Submit
                </Button>
              </Box>
            ) : null}

            {showSchedule ? (
              <Box sx={{ display: "grid", gap: 1 }}>
                <TextField
                  label="Publish at"
                  type="datetime-local"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={scheduleAt}
                  onChange={(event) => setScheduleAt(event.target.value)}
                />
                <Button
                  variant="contained"
                  disabled={!scheduleAt}
                  sx={{ width: "fit-content" }}
                  onClick={() =>
                    void runAction(
                      () => scheduleConcept(productId, concept.id, new Date(scheduleAt).toISOString()),
                      { type: "content_scheduled", title: "Content scheduled" },
                    ).then(() => setShowSchedule(false))
                  }
                >
                  Confirm schedule
                </Button>
              </Box>
            ) : null}
          </Box>

          <Box sx={{ ...GLASS_SX, p: 2, borderRadius: 1, display: "grid", gap: 1.25, alignSelf: "start" }}>
            <Typography sx={{ fontWeight: 700 }}>Comments</Typography>
            {(commentsQuery.data ?? []).length === 0 ? (
              <Typography color="text.secondary" variant="body2">No comments yet.</Typography>
            ) : (
              (commentsQuery.data ?? []).map((comment) => (
                <Box key={comment.id} sx={{ borderBottom: `1px solid ${SURFACE.border}`, pb: 1 }}>
                  <Typography variant="body2">{comment.body}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.created_at).toLocaleString()}
                  </Typography>
                </Box>
              ))
            )}
            <TextField
              label="Add a comment"
              fullWidth
              multiline
              minRows={2}
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
            />
            <Button
              variant="outlined"
              disabled={!commentText.trim() || commentMutation.isPending}
              sx={{ width: "fit-content" }}
              onClick={() => commentMutation.mutate(commentText.trim())}
            >
              Add Comment
            </Button>
          </Box>
        </Box>
      </Box>
    </ScreenFrame>
  );
}

function Field({ label, value, multiline }: { label: string; value?: string | null; multiline?: boolean }) {
  if (!value) return null;
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography sx={{ whiteSpace: multiline ? "pre-wrap" : "normal" }}>{value}</Typography>
    </Box>
  );
}
