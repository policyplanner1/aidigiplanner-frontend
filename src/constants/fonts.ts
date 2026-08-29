export const FONT_FAMILY = '"Outfit", "Helvetica", "Arial", sans-serif';

export const FONTS = {
  family: FONT_FAMILY,
  ui: FONT_FAMILY,
} as const;

export const TYPE = {
  eyebrow: {
    fontFamily: FONT_FAMILY,
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
    lineHeight: 1.3,
    display: "block",
  },
  title: {
    fontFamily: FONT_FAMILY,
    fontWeight: 700,
    letterSpacing: -0.4,
    lineHeight: 1.2,
  },
  section: {
    fontFamily: FONT_FAMILY,
    fontWeight: 600,
    fontSize: "0.95rem",
    letterSpacing: -0.1,
  },
  body: {
    fontFamily: FONT_FAMILY,
    fontWeight: 400,
    lineHeight: 1.55,
  },
  label: {
    fontFamily: FONT_FAMILY,
    fontWeight: 600,
    fontSize: 13,
  },
  metric: {
    fontFamily: FONT_FAMILY,
    fontWeight: 700,
    letterSpacing: -0.5,
    lineHeight: 1.1,
  },
} as const;
