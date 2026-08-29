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

import { ROLE_LABELS } from "../../../permissions/roles";
import { emptyProductAccess, ORG_ASSIGNABLE_ROLES } from "../../../services/team/teamService";
import type { ProductModuleAccess } from "../../../types/auth";
import type { Project } from "../../../types/organization";
import {
  teamMemberSchema,
  type TeamMemberFormValues,
} from "../schemas/teamMemberSchema";

type MemberDialogProps = {
  open: boolean;
  projects: Project[];
  initial?: TeamMemberFormValues;
  onClose: () => void;
  onSubmit: (values: TeamMemberFormValues) => void;
};

function accessForProject(
  list: ProductModuleAccess[],
  projectId: string,
): ProductModuleAccess | undefined {
  return list.find((item) => item.projectId === projectId);
}

export function MemberDialog({
  open,
  projects,
  initial,
  onClose,
  onSubmit,
}: MemberDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "SOCIAL_MANAGER",
      status: "active",
      productAccess: [],
    },
  });

  const role = watch("role");
  const productAccess = watch("productAccess");

  useEffect(() => {
    if (!open) return;
    reset(
      initial ?? {
        name: "",
        email: "",
        role: "SOCIAL_MANAGER",
        status: "active",
        productAccess: [],
      },
    );
  }, [initial, open, reset]);

  const close = () => {
    reset();
    onClose();
  };

  const toggleProject = (projectId: string, checked: boolean) => {
    const next = checked
      ? [...productAccess, emptyProductAccess(projectId)]
      : productAccess.filter((item) => item.projectId !== projectId);
    setValue("productAccess", next, { shouldValidate: true });
  };

  const patchAccess = (
    projectId: string,
    patch: Partial<ProductModuleAccess>,
  ) => {
    setValue(
      "productAccess",
      productAccess.map((item) =>
        item.projectId === projectId ? { ...item, ...patch } : item,
      ),
      { shouldValidate: true },
    );
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <form
        onSubmit={handleSubmit((values) => {
          onSubmit(values);
        })}
      >
        <DialogTitle>{initial ? "Edit teammate" : "Add teammate"}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 1.5 }}>
            Assign the products they can open. Choose modules, or give full
            manage access on a product.
          </Typography>
          <TextField
            label="Full name"
            fullWidth
            margin="normal"
            placeholder="Priya Sharma"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register("name")}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
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
                error={Boolean(errors.role)}
                helperText={errors.role?.message}
              >
                {ORG_ASSIGNABLE_ROLES.map((item) => (
                  <MenuItem key={item} value={item}>
                    {ROLE_LABELS[item]}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
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

          {role === "ADMIN" ? (
            <Typography color="text.secondary" sx={{ mt: 1.5 }}>
              Organization admins can open and manage every product in this
              workspace.
            </Typography>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>
                Product access
              </Typography>
              {typeof errors.productAccess?.message === "string" ? (
                <Typography color="error" variant="body2" sx={{ mb: 1 }}>
                  {errors.productAccess.message}
                </Typography>
              ) : null}
              {projects.length === 0 ? (
                <Typography color="text.secondary">
                  Create a product first, then assign it here.
                </Typography>
              ) : (
                projects.map((project) => {
                  const access = accessForProject(productAccess, project.id);
                  const selected = Boolean(access);
                  return (
                    <Box
                      key={project.id}
                      sx={{
                        border: "1px solid",
                        borderColor: selected ? "secondary.light" : "divider",
                        borderRadius: "6px",
                        p: 1.5,
                        mb: 1,
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selected}
                            onChange={(_, checked) =>
                              toggleProject(project.id, checked)
                            }
                          />
                        }
                        label={
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>
                              {project.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {project.industry}
                            </Typography>
                          </Box>
                        }
                      />
                      {access ? (
                        <Box sx={{ pl: 4, pt: 0.5 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={access.manageAll}
                                onChange={(_, checked) =>
                                  patchAccess(project.id, {
                                    manageAll: checked,
                                    social: true,
                                    marketing: true,
                                    leads: true,
                                    crm: true,
                                  })
                                }
                              />
                            }
                            label="Manage everything on this product"
                          />
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                              opacity: access.manageAll ? 0.5 : 1,
                            }}
                          >
                            {(
                              [
                                ["social", "Social"],
                                ["marketing", "Content"],
                                ["leads", "Leads"],
                                ["crm", "CRM"],
                              ] as const
                            ).map(([key, label]) => (
                              <FormControlLabel
                                key={key}
                                disabled={access.manageAll}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={access[key]}
                                    onChange={(_, checked) =>
                                      patchAccess(project.id, { [key]: checked })
                                    }
                                  />
                                }
                                label={label}
                              />
                            ))}
                          </Box>
                        </Box>
                      ) : null}
                    </Box>
                  );
                })
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={close}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {initial ? "Save" : "Add teammate"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
