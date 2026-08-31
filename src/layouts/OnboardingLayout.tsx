import { ArrowBack } from "@mui/icons-material";
import { Box, Button, Paper, Typography } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { TYPE } from "../constants/fonts";
import { CANVAS_BG, GLASS_SX, SURFACE } from "../constants/layout";
import { AuthBrandMark } from "../features/auth/components/AuthBrandMark";
import { ONBOARDING_STEPS, onboardingStepIndex } from "../features/onboarding/steps";
import { StepProgress } from "../components/ui/StepProgress";

export function OnboardingLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentSegment = location.pathname.split("/")[2];
  const currentIndex = onboardingStepIndex(currentSegment);
  const isCompleted = currentSegment === "completed";

  const goBack = () => {
    if (currentIndex <= 0) return;
    navigate(`/onboarding/${ONBOARDING_STEPS[currentIndex - 1]}`);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: CANVAS_BG,
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 4,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 720 }}>
        <Box sx={{ mb: 2 }}>
          <AuthBrandMark size="compact" />
        </Box>
        <Paper
          sx={{
            ...GLASS_SX,
            p: { xs: 2.5, sm: 4 },
            borderRadius: "20px",
            backgroundColor: "rgba(255,248,243,0.7)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), 0 18px 40px rgba(255,107,69,0.08)",
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "rgba(255,248,243,0.7)",
              "& fieldset": { borderColor: SURFACE.border },
              "&:hover fieldset": { borderColor: "rgba(255,107,69,0.45)" },
              "&.Mui-focused fieldset": { borderColor: "#FF6B45" },
            },
          }}
        >
          {!isCompleted ? <StepProgress steps={[...ONBOARDING_STEPS]} currentIndex={currentIndex} /> : null}
          {!isCompleted && currentIndex > 0 ? (
            <Button
              size="small"
              startIcon={<ArrowBack fontSize="small" />}
              onClick={goBack}
              sx={{ mb: 1.5, color: "text.secondary" }}
            >
              Back
            </Button>
          ) : null}
          <Outlet />
        </Paper>
        <Typography sx={{ ...TYPE.label, color: "text.secondary", textAlign: "center", mt: 2, fontSize: 12 }}>
          Company setup · Brand-safe workspace
        </Typography>
      </Box>
    </Box>
  );
}
