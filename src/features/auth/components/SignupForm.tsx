import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../../hooks/useAuth";
import { TYPE } from "../../../constants/fonts";
import { isLiveAuth } from "../../../services/api/errors";
import { saveSignupCache } from "../../onboarding/signupCache";
import { signupSchema, type SignupFormValues } from "../schemas/authSchemas";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

export function SignupForm() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      companyName: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setSubmitError(null);
    try {
      const result = await signup({
        companyName: values.companyName,
        name: values.name,
        email: values.email,
        password: values.password,
      });
      if (!isLiveAuth()) {
        navigate("/onboarding", { replace: true });
        return;
      }
      const companyId =
        result && typeof result === "object" && "company" in result
          ? (result as { company?: { id?: string } }).company?.id
          : undefined;
      saveSignupCache({
        email: values.email,
        password: values.password,
        companyName: values.companyName,
        companyId,
      });
      navigate(`/verify-email?email=${encodeURIComponent(values.email)}`, { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create account.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography sx={{ ...TYPE.eyebrow, color: "secondary.dark" }}>Create account</Typography>
      <Typography variant="h5" sx={{ ...TYPE.title, mt: 0.75, fontSize: "1.45rem" }}>
        Create your company account
      </Typography>
      <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 0.75, mb: 3 }}>
        {isLiveAuth()
          ? "Set up your workspace and start creating social media content with AI."
          : "Creates a demo company you can explore right away."}
      </Typography>

      {submitError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      ) : null}

      <TextField
        label="Full name"
        fullWidth
        margin="normal"
        placeholder="Vivek Pawar"
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
        {...register("name")}
      />
      <TextField
        label="Work email"
        fullWidth
        margin="normal"
        autoComplete="email"
        placeholder="alex@example.com"
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
        {...register("email")}
      />
      <TextField
        label="Company or group name"
        fullWidth
        margin="normal"
        placeholder="Example Insurance"
        error={Boolean(errors.companyName)}
        helperText={errors.companyName?.message}
        {...register("companyName")}
      />
      <TextField
        label="Password"
        type={showPassword ? "text" : "password"}
        fullWidth
        margin="normal"
        autoComplete="new-password"
        placeholder="At least 10 characters"
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        {...register("password")}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <PasswordStrengthMeter password={watch("password")} />
      <TextField
        label="Confirm password"
        type={showConfirmPassword ? "text" : "password"}
        fullWidth
        margin="normal"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword?.message}
        {...register("confirmPassword")}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  edge="end"
                  size="small"
                >
                  {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <FormControlLabel
        sx={{ mt: 1, alignItems: "flex-start" }}
        control={
          <Checkbox
            checked={watch("terms")}
            onChange={(_, checked) => setValue("terms", checked, { shouldValidate: true })}
          />
        }
        label={
          <Typography sx={{ ...TYPE.body, pt: 1 }}>
            I agree to the{" "}
            <Link component={RouterLink} to="/terms" target="_blank" rel="noopener">
              Terms
            </Link>{" "}
            and{" "}
            <Link component={RouterLink} to="/privacy-policy" target="_blank" rel="noopener">
              Privacy Policy
            </Link>
          </Typography>
        }
      />
      {errors.terms ? <FormHelperText error>{errors.terms.message}</FormHelperText> : null}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        sx={{ mt: 2.5, borderRadius: "999px", py: 1.15 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account..." : "Create Account"}
      </Button>

      <Typography sx={{ mt: 2 }} color="text.secondary">
        Already have an account?{" "}
        <Link component={RouterLink} to="/login">
          Sign in
        </Link>
      </Typography>
    </Box>
  );
}
