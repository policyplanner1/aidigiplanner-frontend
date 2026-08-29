import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SOCIAL_PLATFORMS } from "../../../constants/platforms";
import type { SocialPlatform } from "../../../types/organization";

const connectSchema = z.object({
  platform: z.string().min(1, "Select a platform"),
  accountName: z.string().min(2, "Account name is required"),
});

type ConnectFormValues = z.infer<typeof connectSchema>;

type ConnectAccountDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { platform: SocialPlatform; accountName: string }) => void;
};

export function ConnectAccountDialog({
  open,
  onClose,
  onSubmit,
}: ConnectAccountDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConnectFormValues>({
    resolver: zodResolver(connectSchema),
    defaultValues: {
      platform: "instagram",
      accountName: "",
    },
  });

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <form
        onSubmit={handleSubmit((values) => {
          onSubmit({
            platform: values.platform as SocialPlatform,
            accountName: values.accountName,
          });
          close();
        })}
      >
        <DialogTitle>Connect social account</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            This is a UI connection only. Real OAuth will go through the backend
            later. Never store platform secrets in the browser.
          </Typography>
          <TextField
            select
            label="Platform"
            fullWidth
            margin="normal"
            defaultValue="instagram"
            placeholder="Select a platform"
            error={Boolean(errors.platform)}
            helperText={errors.platform?.message}
            {...register("platform")}
          >
            {SOCIAL_PLATFORMS.map((platform) => (
              <MenuItem key={platform.id} value={platform.id}>
                {platform.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Account name"
            fullWidth
            margin="normal"
            placeholder="@brand or Page name"
            error={Boolean(errors.accountName)}
            helperText={errors.accountName?.message}
            {...register("accountName")}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={close}>Cancel</Button>
          <Button type="submit" variant="contained">
            Connect
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
