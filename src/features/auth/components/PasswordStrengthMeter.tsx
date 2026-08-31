import { Box, Typography } from "@mui/material";

import { passwordStrengthScore } from "./passwordStrengthScore";

const LEVELS = [
  { label: "Too weak", color: "#E25030" },
  { label: "Weak", color: "#E8A838" },
  { label: "Good", color: "#1F8A80" },
  { label: "Strong", color: "#2A9D6A" },
] as const;

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const score = passwordStrengthScore(password);
  const level = LEVELS[Math.max(score - 1, 0)];

  return (
    <Box sx={{ mt: 0.75, mb: 0.5 }}>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {LEVELS.map((_, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              height: 4,
              borderRadius: "999px",
              backgroundColor: index < score ? level.color : "rgba(232,221,210,0.9)",
              transition: "background-color 0.2s ease",
            }}
          />
        ))}
      </Box>
      <Typography variant="caption" sx={{ color: level.color, mt: 0.4, display: "block" }}>
        {level.label}
      </Typography>
    </Box>
  );
}
