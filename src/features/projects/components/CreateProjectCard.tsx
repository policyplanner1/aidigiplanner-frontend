import { Add } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

import { FONT_FAMILY, TYPE } from "../../../constants/fonts";

type CreateProjectCardProps = {
  onCreate: () => void;
  delay?: number;
};

export function CreateProjectCard({ onCreate, delay = 0 }: CreateProjectCardProps) {
  return (
    <Box
      onClick={onCreate}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onCreate();
        }
      }}
      sx={{
        height: "100%",
        minHeight: 280,
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        px: 2.5,
        py: 3,
        borderRadius: "18px",
        border: `1.5px dashed #FF6B45`,
        background: "linear-gradient(180deg, rgba(255,230,216,0.7) 0%, rgba(220,238,234,0.55) 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75)",
        animation: "dashIn 0.45s ease both",
        animationDelay: `${delay}ms`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "@keyframes dashIn": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 16px 32px rgba(255,107,69,0.18)",
        },
      }}
    >
      <Box>
        <Box
          sx={{
            width: 58,
            height: 58,
            mx: "auto",
            borderRadius: "16px",
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg, #FF6B45, #1F8A80)",
            color: "#FFF9F5",
            boxShadow: "0 10px 20px rgba(255,107,69,0.28)",
          }}
        >
          <Add />
        </Box>
        <Typography sx={{ ...TYPE.section, mt: 1.6, fontSize: "1.1rem", fontWeight: 800, letterSpacing: -0.3 }}>
          Create New Project
        </Typography>
        <Typography sx={{ fontFamily: FONT_FAMILY, fontWeight: 400, mt: 0.55, color: "text.secondary", fontSize: 13 }}>
          Start a new brand workspace for your team.
        </Typography>
      </Box>
    </Box>
  );
}
