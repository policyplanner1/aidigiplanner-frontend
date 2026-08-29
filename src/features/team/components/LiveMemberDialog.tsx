import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import type { ApiCompanyRole } from "../../../types/api";
import type { Project } from "../../../types/organization";
import type { LiveTeamMember } from "../../../services/team/liveTeam";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.enum(["company_admin", "member"]),
  status: z.enum(["active", "suspended"]),
  projectIds: z.array(z.string()),
});

export type LiveMemberFormValues = z.infer<typeof schema>;

type LiveMemberDialogProps = {
  open: boolean;
  projects: Project[];
  initial?: LiveTeamMember | null;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (values: LiveMemberFormValues) => Promise<void> | void;
};

export function LiveMemberDialog({
  open,
  projects,
  initial,
  busy,
  onClose,
  onSubmit,
}: LiveMemberDialogProps) {
  const editing = Boolean(initial);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LiveMemberFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      role: "member",
      status: "active",
      projectIds: [],
    },
  });

  const role = watch("role");
  const projectIds = watch("projectIds");

  useEffect(() => {
    if (!open) return;
    reset(
      initial
        ? {
            name: initial.name,
            email: initial.email,
            role: initial.role,
            status: initial.status,
            projectIds: initial.projects.map((item) => item.projectId),
          }
        : {
            name: "",
            email: "",
            role: "member",
            status: "active",
            projectIds: [],
          },
    );
  }, [initial, open, reset]);

  const toggleProject = (projectId: string, checked: boolean) => {
    const next = checked
      ? [...projectIds, projectId]
      : projectIds.filter((id) => id !== projectId);
    setValue("projectIds", next, { shouldValidate: true });
  };

  const submitting = isSubmitting || busy;

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <form
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
        })}
      >
        <DialogTitle>{editing ? "Edit teammate" : "Add teammate"}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 1.5 }}>
            {editing
              ? "Update their company role or suspend access."
              : "They join this company. Members can also be assigned to products."}
          </Typography>
          <TextField
            label="Full name"
            fullWidth
            margin="normal"
            disabled={editing}
            placeholder="Priya Sharma"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register("name")}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            disabled={editing}
            placeholder="priya@company.com"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register("email")}
          />
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Role"
                fullWidth
                margin="normal"
                value={field.value}
                onChange={field.onChange}
              >
                <MenuItem value={"company_admin" satisfies ApiCompanyRole}>
                  Organization Admin
                </MenuItem>
                <MenuItem value={"member" satisfies ApiCompanyRole}>Member</MenuItem>
              </TextField>
            )}
          />
          {editing ? (
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Status"
                  fullWidth
                  margin="normal"
                  value={field.value}
                  onChange={field.onChange}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </TextField>
              )}
            />
          ) : null}

          {!editing && role === "member" ? (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>Product access</Typography>
              {projects.length === 0 ? (
                <Typography color="text.secondary">
                  No products yet. You can still add them to the company.
                </Typography>
              ) : (
                projects.map((project) => (
                  <FormControlLabel
                    key={project.id}
                    sx={{ display: "flex", ml: 0, mb: 0.5 }}
                    control={
                      <Checkbox
                        checked={projectIds.includes(project.id)}
                        onChange={(_, checked) => toggleProject(project.id, checked)}
                      />
                    }
                    label={project.name}
                  />
                ))
              )}
            </Box>
          ) : null}

          {role === "company_admin" ? (
            <Typography color="text.secondary" sx={{ mt: 1.5 }}>
              Organization admins can manage the company and every product.
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? "Saving..." : editing ? "Save" : "Add teammate"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
