import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

type DeleteProjectDialogProps = {
  open: boolean;
  projectName: string;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteProjectDialog({
  open,
  projectName,
  busy,
  error,
  onClose,
  onConfirm,
}: DeleteProjectDialogProps) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Delete {projectName}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">
          This workspace and its project data will be removed. This cannot be undone.
        </Typography>
        {error ? (
          <Typography color="error" sx={{ mt: 1.5 }}>
            {error}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="contained" color="error" disabled={busy} onClick={onConfirm}>
          {busy ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
