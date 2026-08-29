import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

type RejectCompanyDialogProps = {
  open: boolean;
  companyName: string;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export function RejectCompanyDialog({
  open,
  companyName,
  busy,
  error,
  onClose,
  onConfirm,
}: RejectCompanyDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Reject {companyName}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          The company admin will see this reason. They cannot open the workspace
          until a Super Admin approves them.
        </Typography>
        <TextField
          autoFocus
          label="Reason"
          fullWidth
          multiline
          minRows={3}
          placeholder="Missing documents, duplicate company, or a policy issue."
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          error={Boolean(error)}
          helperText={error}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={busy || reason.trim().length < 1}
          onClick={() => onConfirm(reason.trim())}
        >
          {busy ? "Rejecting..." : "Reject"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
