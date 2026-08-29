import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { PageHeader } from "../../../components/ui/PageHeader";
import { getApiErrorMessage } from "../../../services/api/errors";
import {
  companyRoleLabel,
  type LiveTeamMember,
} from "../../../services/team/liveTeam";
import type { Project } from "../../../types/organization";
import { LiveMemberDialog, type LiveMemberFormValues } from "./LiveMemberDialog";
import {
  useAddLiveTeamMember,
  useLiveTeamMembers,
  useRemoveLiveTeamMember,
  useUpdateLiveTeamMember,
} from "../hooks/useLiveTeamMembers";

type LiveTeamPanelProps = {
  companyId: string;
  projects: Project[];
  currentUserId?: string;
  canManage: boolean;
};

function ProjectAccessCell({ member }: { member: LiveTeamMember }) {
  if (member.role === "company_admin") {
    return <Chip size="small" color="secondary" label="All products" />;
  }
  if (member.projects.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No products
      </Typography>
    );
  }
  return (
    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
      {member.projects.map((item) => (
        <Chip key={`${member.id}-${item.projectId}`} size="small" label={item.projectName} />
      ))}
    </Box>
  );
}

export function LiveTeamPanel({
  companyId,
  projects,
  currentUserId,
  canManage,
}: LiveTeamPanelProps) {
  const members = useLiveTeamMembers(companyId, projects);
  const addMember = useAddLiveTeamMember(companyId);
  const updateMember = useUpdateLiveTeamMember(companyId);
  const removeMember = useRemoveLiveTeamMember(companyId);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LiveTeamMember | null>(null);
  const [removing, setRemoving] = useState<LiveTeamMember | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
  };

  const save = async (values: LiveMemberFormValues) => {
    setError(null);
    try {
      if (editing) {
        await updateMember.mutateAsync({
          memberId: editing.id,
          role: values.role,
          status: values.status,
        });
        setBanner(`${values.name || editing.name} was updated.`);
      } else {
        await addMember.mutateAsync({
          name: values.name,
          email: values.email,
          role: values.role,
          projectIds: values.role === "member" ? values.projectIds : [],
        });
        setBanner(`${values.name} was added. They can sign in with ${values.email}.`);
      }
      closeDialog();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const confirmRemove = async () => {
    if (!removing) return;
    setError(null);
    try {
      await removeMember.mutateAsync(removing.id);
      setBanner(`${removing.name} was removed.`);
      setRemoving(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const rows = members.data ?? [];

  return (
    <Box sx={{ display: "grid", gap: 2.5 }}>
      <PageHeader
        eyebrow="Workspace"
        title="Team"
        description="People in this company. Organization admins manage the workspace; members can be assigned to products."
        action={
          canManage ? (
            <Button
              variant="contained"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              Add teammate
            </Button>
          ) : null
        }
      />

      {banner ? <Alert severity="success">{banner}</Alert> : null}
      {error ? (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Paper sx={{ overflow: "auto", borderRadius: 1 }}>
        {members.isLoading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 8 }}>
            <CircularProgress size={28} />
          </Box>
        ) : members.isError ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {getApiErrorMessage(members.error)}
          </Alert>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Project access</TableCell>
                <TableCell>Status</TableCell>
                {canManage ? <TableCell align="right"> </TableCell> : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 5 : 4}>
                    <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                      No teammates yet. Add the first person to this company.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((member) => {
                  const isSelf = member.userId === currentUserId;
                  return (
                    <TableRow key={member.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700 }}>
                          {member.name || member.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.email}
                        </Typography>
                      </TableCell>
                      <TableCell>{companyRoleLabel(member.role)}</TableCell>
                      <TableCell sx={{ maxWidth: 420 }}>
                        <ProjectAccessCell member={member} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={member.status === "active" ? "success" : "default"}
                          label={member.status}
                        />
                      </TableCell>
                      {canManage ? (
                        <TableCell align="right">
                          <Button
                            size="small"
                            onClick={() => {
                              setError(null);
                              setEditing(member);
                              setOpen(true);
                            }}
                          >
                            Manage
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            disabled={isSelf || removeMember.isPending}
                            onClick={() => {
                              setError(null);
                              setRemoving(member);
                            }}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <LiveMemberDialog
        open={open}
        projects={projects}
        initial={editing}
        busy={addMember.isPending || updateMember.isPending}
        onClose={closeDialog}
        onSubmit={save}
      />

      <Dialog open={Boolean(removing)} onClose={() => setRemoving(null)} fullWidth maxWidth="xs">
        <DialogTitle>Remove teammate</DialogTitle>
        <DialogContent>
          <Typography>
            Remove {removing?.name} from this company? They will lose access to the
            workspace.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRemoving(null)} disabled={removeMember.isPending}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={removeMember.isPending}
            onClick={() => void confirmRemove()}
          >
            {removeMember.isPending ? "Removing..." : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
