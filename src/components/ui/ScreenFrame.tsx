import { Box } from "@mui/material";
import type { ReactNode } from "react";

import { FONT_FAMILY } from "../../constants/fonts";

type ScreenFrameProps = {
  children: ReactNode;
};

export function ScreenFrame({ children }: ScreenFrameProps) {
  return <Box sx={{ fontFamily: FONT_FAMILY }}>{children}</Box>;
}
