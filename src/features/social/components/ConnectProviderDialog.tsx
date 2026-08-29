import { Box, Button, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";

import { CONNECT_PROVIDERS } from "../../../constants/connectProviders";
import type { ConnectProvider } from "../../../types/social";

type ConnectProviderDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (provider: ConnectProvider) => void;
};

export function ConnectProviderDialog({
  open,
  onClose,
  onSelect,
}: ConnectProviderDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Connect social account</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          React only starts the connection. OAuth, tokens, and publishing stay on your backend.
        </Typography>
        <Box sx={{ display: "grid", gap: 1.25, pb: 1 }}>
          {CONNECT_PROVIDERS.map((provider) => (
            <Box
              key={provider.id}
              component="button"
              type="button"
              onClick={() => onSelect(provider.id)}
              sx={{
                textAlign: "left",
                cursor: "pointer",
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                borderRadius: "6px",
                p: 1.75,
                font: "inherit",
                color: "inherit",
                "&:hover": { borderColor: "primary.main", backgroundColor: "#FFF8F4" },
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>{provider.label}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {provider.description}
              </Typography>
            </Box>
          ))}
        </Box>
        <Button onClick={onClose} sx={{ mt: 0.5, mb: 1 }}>
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}
