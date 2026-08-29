import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import { SOCIAL_PLATFORMS } from "../../../constants/platforms";
import type { SocialAccount } from "../../../types/organization";

type ManageAccountDialogProps = {
  account: SocialAccount | null;
  projectName: string;
  busy: boolean;
  onClose: () => void;
  onReconnect: () => void;
  onDisconnect: () => void;
};

function healthCopy(account: SocialAccount) {
  if (account.tokenHealth === "needs_reconnect") {
    return "Connection needs attention. Reconnect before the next scheduled publish.";
  }
  if (account.tokenHealth === "expiring") {
    return "Token is approaching expiry. Reconnect now so scheduled posts do not fail.";
  }
  return "Token valid. Publishing stays on the backend queue.";
}

export function ManageAccountDialog({
  account,
  projectName,
  busy,
  onClose,
  onReconnect,
  onDisconnect,
}: ManageAccountDialogProps) {
  if (!account) return null;

  const platform =
    SOCIAL_PLATFORMS.find((item) => item.id === account.platform)?.label ??
    account.platform;

  return (
    <Dialog open={Boolean(account)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Manage {platform}</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontWeight: 700 }}>{account.handle ?? account.accountName}</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Product: {projectName}
        </Typography>
        {account.metrics?.subscribers ? (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Subscribers: {account.metrics.subscribers.toLocaleString()}
          </Typography>
        ) : null}
        {account.metrics?.phoneNumber ? (
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Phone: {account.metrics.phoneNumber}
          </Typography>
        ) : null}
        <Typography sx={{ mt: 2 }}>{healthCopy(account)}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Disconnect revokes this project’s access. Historical posts and analytics stay
          in the workspace.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={onReconnect} disabled={busy}>
          Reconnect
        </Button>
        <Button color="error" onClick={onDisconnect} disabled={busy}>
          Disconnect
        </Button>
      </DialogActions>
    </Dialog>
  );
}
