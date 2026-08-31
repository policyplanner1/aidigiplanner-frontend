import { Box, Typography } from "@mui/material";

import { TYPE } from "../../constants/fonts";
import { SURFACE } from "../../constants/layout";

export function CardChoice({
  selected,
  title,
  body,
  onClick,
}: {
  selected: boolean;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: "16px",
        cursor: "pointer",
        border: `1.5px solid ${selected ? "#FF6B45" : SURFACE.border}`,
        backgroundColor: selected ? "rgba(255,107,69,0.08)" : SURFACE.well,
        transition: "border-color 0.15s ease, background-color 0.15s ease",
      }}
    >
      <Typography sx={{ ...TYPE.section }}>{title}</Typography>
      <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 0.5, fontSize: 14 }}>{body}</Typography>
    </Box>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.75, borderBottom: `1px solid ${SURFACE.border}` }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}

export function StepHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <Typography sx={{ ...TYPE.eyebrow, color: "secondary.dark" }}>{eyebrow}</Typography>
      <Typography variant="h5" sx={{ ...TYPE.title, mt: 0.5, mb: 2, fontSize: "1.45rem" }}>
        {title}
      </Typography>
    </>
  );
}
