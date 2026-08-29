import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";

import { TYPE } from "../../../constants/fonts";

type DashboardSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function DashboardSection({
  eyebrow,
  title,
  description,
  action,
}: DashboardSectionProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "stretch", sm: "flex-end" },
        justifyContent: "space-between",
        gap: 1.5,
        flexDirection: { xs: "column", sm: "row" },
        mb: 1.75,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {eyebrow ? (
          <Typography sx={{ ...TYPE.eyebrow, color: "secondary.main" }}>
            {eyebrow}
          </Typography>
        ) : null}
        <Typography sx={{ ...TYPE.title, fontSize: "1.15rem", mt: eyebrow ? 0.35 : 0 }}>
          {title}
        </Typography>
        {description ? (
          <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 0.4, maxWidth: 560 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
    </Box>
  );
}
