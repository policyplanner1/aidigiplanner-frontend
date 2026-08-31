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
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { PageHeader } from "../../../components/ui/PageHeader";
import { getApiErrorMessage } from "../../../services/api/errors";
import type { ApiProductMemberRole } from "../../../types/api";
import {
  useAddProjectMember,
  useCompanyMemberOptions,
  useProjectMembers,
  useRemoveProjectMember,
} from "../hooks/useProjectMembers";

const PRODUCT_ROLE_LABELS: Record<ApiProductMemberRole, string> = {
  product_manager: "Product Manager",
  creator: "Content Creator",
  approver: "Approver",
  publisher: "Publisher",
  analyst: "Analyst",
};

const PRODUCT_ROLES = Object.keys(PRODUCT_ROLE_LABELS) as ApiProductMemberRole[];

type ProjectTeamPanelProps = {
  projectId: string;
  companyId?: string | null;
  live: boolean;
  canManage: boolean;
};

export function ProjectTeamPanel({
  projectId,
  companyId,
  live,
  canManage,
}: ProjectTeamPanelProps) {
  const members = useProjectMembers(projectId, live);
  const companyMembers = useCompanyMemberOptions(companyId ?? undefined, live && Boolean(companyId));
  const addMember = useAddProjectMember(projectId, companyId ?? undefined);
  const removeMember = useRemoveProjectMember(projectId, companyId ?? undefined);

  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState<{ id: string; user_full_name: string; user_email: string } | null>(null);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<ApiProductMemberRole>("creator");
  const [banner, setBanner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rows = members.data ?? [];
  const assignedUserIds = new Set(rows.map((row) => row.user_id));
  const available = (companyMembers.data ?? []).filter(
    (member) => !assignedUserIds.has(member.user_id),
  );

  const onAdd = async () => {
    if (!userId) return;
    setError(null);
    try {
      await addMember.mutateAsync({ user_id: userId, role });
      const picked = available.find((member) => member.user_id === userId);
      setBanner(`${picked?.user_full_name || "Teammate"} was added to this product.`);
      setOpen(false);
      setUserId("");
      setRole("creator");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const onRemove = async () => {
    if (!removing) return;
    setError(null);
    try {
      await removeMember.mutateAsync(removing.id);
      setBanner(`${removing.user_full_name || removing.user_email} was removed from this product.`);
      setRemoving(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <PageHeader
        eyebrow="Product access"
        title="Product team"
        description="People who can work in this product. Add them from the company team."
        action={
          canManage ? (
            <Button
              variant="contained"
              onClick={() => {
                setError(null);
                setOpen(true);
              }}
            >
              Add member
            </Button>
          ) : null
        }
      />

      {banner ? <Alert severity="success" onClose={() => setBanner(null)}>{banner}</Alert> : null}
      {error && !open ? (
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
                <TableCell>Added</TableCell>
                {canManage ? <TableCell align="right"> </TableCell> : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 4 : 3}>
                    <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                      No one is assigned to this product yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((member) => {
                  return (
                    <TableRow key={member.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700 }}>
                          {member.user_full_name || member.user_email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.user_email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={PRODUCT_ROLE_LABELS[member.role] ?? member.role} />
                      </TableCell>
                      <TableCell>{formatWhen(member.created_at)}</TableCell>
                      {canManage ? (
                        <TableCell align="right">
                          <Button
                            size="small"
                            color="error"
                            disabled={removeMember.isPending}
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

      <Dialog
        open={open}
        onClose={addMember.isPending ? undefined : () => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add product member</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 1.5 }}>
            Choose someone already in the company, then set their access on this product.
          </Typography>
          {error ? (
            <Alert severity="error" sx={{ mb: 1.5 }}>
              {error}
            </Alert>
          ) : null}
          {available.length === 0 ? (
            <Alert severity="info">
              Everyone in the company is already on this product. Add people on Team first.
            </Alert>
          ) : (
            <>
              <TextField
                select
                label="Teammate"
                fullWidth
                margin="normal"
                value={userId}
                placeholder="Select a teammate"
                slotProps={{ select: { displayEmpty: true } }}
                onChange={(event) => setUserId(event.target.value)}
              >
                <MenuItem value="" disabled>
                  Select a teammate
                </MenuItem>
                {available.map((member) => (
                  <MenuItem key={member.user_id} value={member.user_id}>
                    {member.user_full_name || member.user_email} · {member.user_email}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Product role"
                fullWidth
                margin="normal"
                value={role}
                placeholder="Select a role"
                onChange={(event) => setRole(event.target.value as ApiProductMemberRole)}
              >
                {PRODUCT_ROLES.map((item) => (
                  <MenuItem key={item} value={item}>
                    {PRODUCT_ROLE_LABELS[item]}
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={addMember.isPending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={addMember.isPending || !userId || available.length === 0}
            onClick={() => void onAdd()}
          >
            {addMember.isPending ? "Adding..." : "Add member"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(removing)}
        onClose={removeMember.isPending ? undefined : () => setRemoving(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Remove from product</DialogTitle>
        <DialogContent>
          <Typography>
            Remove {removing?.user_full_name || removing?.user_email} from this product? They
            stay in the company team.
          </Typography>
          {error ? (
            <Alert severity="error" sx={{ mt: 1.5 }}>
              {error}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRemoving(null)} disabled={removeMember.isPending}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={removeMember.isPending}
            onClick={() => void onRemove()}
          >
            {removeMember.isPending ? "Removing..." : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { dateStyle: "medium" });
}
