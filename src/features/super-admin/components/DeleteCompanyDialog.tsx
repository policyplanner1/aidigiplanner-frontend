import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

type DeleteCompanyDialogProps = {
  open: boolean;
  companyName: string;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteCompanyDialog({
  open,
  companyName,
  busy,
  error,
  onClose,
  onConfirm,
}: DeleteCompanyDialogProps) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Delete {companyName}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">
          This permanently removes the company and cannot be undone.
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
