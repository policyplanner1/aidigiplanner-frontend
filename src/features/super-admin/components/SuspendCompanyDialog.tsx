import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

type SuspendCompanyDialogProps = {
  open: boolean;
  companyName: string;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function SuspendCompanyDialog({
  open,
  companyName,
  busy,
  error,
  onClose,
  onConfirm,
}: SuspendCompanyDialogProps) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Suspend {companyName}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">
          This company will be paused. Members cannot use the workspace until a Super
          Admin restores it.
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
        <Button variant="contained" color="warning" disabled={busy} onClick={onConfirm}>
          {busy ? "Suspending..." : "Suspend"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
