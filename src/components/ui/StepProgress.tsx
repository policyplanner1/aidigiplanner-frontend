import { Box, Typography } from "@mui/material";

type StepProgressProps = {
  steps: string[];
  currentIndex: number;
};

// Reusable segmented progress bar (spec §8, §47) — used by the onboarding
// wizard today; generic enough for any other step-based flow.
export function StepProgress({ steps, currentIndex }: StepProgressProps) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: "flex", gap: 0.75 }}>
        {steps.map((step, index) => (
          <Box
            key={step}
            sx={{
              flex: 1,
              height: 4,
              borderRadius: "999px",
              backgroundColor: index <= currentIndex ? "#1F8A80" : "rgba(232,221,210,0.9)",
              transition: "background-color 0.25s ease",
            }}
          />
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
        Step {currentIndex + 1} of {steps.length}
      </Typography>
    </Box>
  );
}
