import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Checkbox, FormControlLabel, FormHelperText, Link, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../../hooks/useAuth";
import { TYPE } from "../../../constants/fonts";
import { isLiveAuth } from "../../../services/api/errors";
import { saveSignupCache } from "../../onboarding/signupCache";
import { signupSchema, type SignupFormValues } from "../schemas/authSchemas";

export function SignupForm() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

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
          ? "We’ll email a 6-digit code. The company name is saved here and won’t be asked again."
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
        label="Company name"
        fullWidth
        margin="normal"
        placeholder="Example Insurance"
        error={Boolean(errors.companyName)}
        helperText={errors.companyName?.message}
        {...register("companyName")}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        autoComplete="new-password"
        placeholder="At least 10 characters"
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        {...register("password")}
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
            I agree to the Terms and Privacy Policy
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
