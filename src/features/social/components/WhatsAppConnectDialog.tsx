import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";

const whatsappSchema = z.object({
  displayName: z.string().min(2, "Business name is required"),
  phoneNumber: z.string().min(8, "Enter the WhatsApp Business phone number"),
});

type WhatsAppFormValues = z.infer<typeof whatsappSchema>;

type WhatsAppConnectDialogProps = {
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: WhatsAppFormValues) => void;
};

export function WhatsAppConnectDialog({
  open,
  submitting,
  onClose,
  onSubmit,
}: WhatsAppConnectDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WhatsAppFormValues>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: { displayName: "", phoneNumber: "" },
  });

  const close = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <form
        onSubmit={handleSubmit((values) => {
          onSubmit(values);
        })}
      >
        <DialogTitle>WhatsApp Business</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            WhatsApp is for lead follow-up, reminders, campaigns, and conversations.
            It is not a feed publishing channel. Your backend attaches the Cloud API
            number — this screen only collects the business identity.
          </Typography>
          <TextField
            label="Business account name"
            fullWidth
            margin="normal"
            placeholder="Your business name"
            error={Boolean(errors.displayName)}
            helperText={errors.displayName?.message}
            {...register("displayName")}
          />
          <TextField
            label="Phone number"
            fullWidth
            margin="normal"
            placeholder="+91 98xxxxxxx"
            error={Boolean(errors.phoneNumber)}
            helperText={errors.phoneNumber?.message}
            {...register("phoneNumber")}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={close}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            Connect WhatsApp
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
