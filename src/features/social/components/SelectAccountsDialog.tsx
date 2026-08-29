import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { SOCIAL_PLATFORMS } from "../../../constants/platforms";
import type { OAuthSession } from "../../../types/social";

type SelectAccountsDialogProps = {
  open: boolean;
  session: OAuthSession | undefined;
  loading: boolean;
  error: string | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (accountIds: string[]) => void;
};

function platformLabel(platform: string) {
  return SOCIAL_PLATFORMS.find((item) => item.id === platform)?.label ?? platform;
}

export function SelectAccountsDialog({
  open,
  session,
  loading,
  error,
  submitting,
  onClose,
  onConfirm,
}: SelectAccountsDialogProps) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (session?.accounts.length) {
      setSelected(session.accounts.map((item) => item.id));
    }
  }, [session]);

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Select accounts</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Choose which Pages and professional accounts this project can publish to.
          Tokens are never stored in the browser.
        </Typography>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        {loading ? (
          <Typography color="text.secondary">Loading authorized accounts…</Typography>
        ) : null}
        {session?.accounts.map((account) => (
          <FormControlLabel
            key={account.id}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              mx: 0,
              mb: 1,
              p: 1.25,
              border: "1px solid",
              borderColor: selected.includes(account.id) ? "secondary.light" : "divider",
              borderRadius: "6px",
              width: "100%",
            }}
            control={
              <Checkbox
                checked={selected.includes(account.id)}
                onChange={() => toggle(account.id)}
              />
            }
            label={
              <span>
                <Typography sx={{ fontWeight: 700 }}>
                  {platformLabel(account.platform)} — {account.handle ?? account.accountName}
                </Typography>
                {account.subscribers ? (
                  <Typography variant="body2" color="text.secondary">
                    Subscribers: {account.subscribers.toLocaleString()}
                  </Typography>
                ) : null}
                {account.location ? (
                  <Typography variant="body2" color="text.secondary">
                    {account.location}
                  </Typography>
                ) : null}
              </span>
            }
          />
        ))}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={selected.length === 0 || submitting || Boolean(error)}
          onClick={() => onConfirm(selected)}
        >
          Connect selected
        </Button>
      </DialogActions>
    </Dialog>
  );
}
