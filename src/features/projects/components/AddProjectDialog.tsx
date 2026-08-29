import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  projectSchema,
  type ProjectFormValues,
} from "../schemas/projectSchema";

type AddProjectDialogProps = {
  open: boolean;
  live?: boolean;
  busy?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: ProjectFormValues) => Promise<void> | void;
};

const defaults: ProjectFormValues = {
  name: "",
  description: "",
  industry: "",
  social: true,
  marketing: true,
  leads: true,
  crm: true,
};

export function AddProjectDialog({
  open,
  live = false,
  busy = false,
  error,
  onClose,
  onSubmit,
}: AddProjectDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) reset(defaults);
  }, [open, reset]);

  const submitting = isSubmitting || busy;

  const close = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <form
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
        })}
      >
        <DialogTitle>Add project</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {live
              ? "Creates a brand workspace in this company."
              : "A project is one brand or client workspace. Social accounts, AI content, leads, and CRM stay inside that project."}
          </Typography>
          {error ? (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          ) : null}
          <TextField
            label="Project name"
            fullWidth
            margin="normal"
            placeholder="Family Health Cover"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register("name")}
          />
          {live ? null : (
            <TextField
              label="Industry"
              fullWidth
              margin="normal"
              placeholder="Insurance, D2C, SaaS"
              error={Boolean(errors.industry)}
              helperText={errors.industry?.message}
              {...register("industry")}
            />
          )}
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            minRows={2}
            placeholder="What this brand sells and who it serves."
            {...register("description")}
          />
          {live ? null : (
            <>
              <Typography sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                Enable modules
              </Typography>
              <FormGroup>
                <Controller
                  name="social"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(_, checked) => field.onChange(checked)}
                        />
                      }
                      label="Social media accounts and publishing"
                    />
                  )}
                />
                <Controller
                  name="marketing"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(_, checked) => field.onChange(checked)}
                        />
                      }
                      label="Digital marketing and AI content"
                    />
                  )}
                />
                <Controller
                  name="leads"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(_, checked) => field.onChange(checked)}
                        />
                      }
                      label="Lead generation"
                    />
                  )}
                />
                <Controller
                  name="crm"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(_, checked) => field.onChange(checked)}
                        />
                      }
                      label="CRM and pipeline"
                    />
                  )}
                />
              </FormGroup>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Creating..." : "Create project"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
