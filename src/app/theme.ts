import { createTheme } from "@mui/material/styles";

import { FONT_FAMILY } from "../constants/fonts";
import { SURFACE } from "../constants/layout";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#FF6B45",
      dark: "#E25030",
      light: "#FF9A7A",
      contrastText: "#FFF9F5",
    },
    secondary: {
      main: "#1F8A80",
      dark: "#176E66",
      light: "#4EB5AB",
      contrastText: "#F4FFFD",
    },
    success: {
      main: "#2A9D6A",
    },
    warning: {
      main: "#E8A838",
    },
    background: {
      default: SURFACE.canvas,
      paper: SURFACE.paper,
    },
    text: {
      primary: "#4A342C",
      secondary: "#8A6F64",
    },
    divider: SURFACE.border,
  },
  typography: {
    fontFamily: FONT_FAMILY,
    h3: { fontWeight: 700, letterSpacing: -0.6, fontSize: "1.85rem", lineHeight: 1.15 },
    h4: { fontWeight: 700, letterSpacing: -0.4, fontSize: "1.35rem", lineHeight: 1.2 },
    h5: { fontWeight: 700, letterSpacing: -0.2, fontSize: "1.1rem", lineHeight: 1.25 },
    h6: { fontWeight: 600, fontSize: "0.95rem", letterSpacing: -0.1 },
    subtitle1: { fontWeight: 600, fontSize: "0.95rem" },
    subtitle2: { fontWeight: 600, fontSize: "0.8rem", letterSpacing: 0.15 },
    body1: { fontWeight: 400, fontSize: "0.95rem", lineHeight: 1.55 },
    body2: { fontWeight: 400, fontSize: "0.875rem", lineHeight: 1.5 },
    caption: { fontWeight: 500, fontSize: "0.75rem", lineHeight: 1.4, letterSpacing: 0.15 },
    overline: {
      fontWeight: 700,
      fontSize: "0.68rem",
      letterSpacing: 0.8,
      lineHeight: 1.3,
      textTransform: "uppercase",
    },
    button: { fontWeight: 600, letterSpacing: 0.1 },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: SURFACE.canvas,
          fontFamily: FONT_FAMILY,
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(31, 138, 128, 0.28) transparent",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 4,
          paddingInline: 14,
          paddingBlock: 7,
          boxShadow: "none",
        },
        contained: {
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${SURFACE.border}`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72), 0 10px 28px rgba(74, 52, 44, 0.04)",
          borderRadius: 6,
          backgroundColor: "rgba(255,248,243,0.82)",
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "rgba(255,248,243,0.88)",
          borderRadius: 6,
          boxShadow: "none",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: SURFACE.well,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 4,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          boxShadow: "none",
          backgroundColor: "transparent",
          backgroundImage: "none",
          backdropFilter: "blur(16px)",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 6,
          border: `1px solid ${SURFACE.border}`,
          boxShadow: "0 10px 28px rgba(74, 52, 44, 0.08)",
        },
      },
    },
  },
});
