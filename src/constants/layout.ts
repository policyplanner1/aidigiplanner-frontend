export const SIDEBAR_WIDTH = 232;
export const HEADER_HEIGHT = 56;

export const SURFACE = {
  canvas: "#F4EBE3",
  paper: "#FFF8F3",
  well: "#F6EEE6",
  heroFrom: "#FFF8F3",
  heroMid: "#FFE6D8",
  heroTo: "#DCEEEA",
  border: "#E8DDD2",
} as const;

export const SIDEBAR_BG = [
  `radial-gradient(240px 200px at 120% -8%, ${SURFACE.heroMid} 0%, transparent 64%)`,
  `radial-gradient(220px 180px at -28% 108%, ${SURFACE.heroTo} 0%, transparent 60%)`,
  `linear-gradient(180deg, ${SURFACE.heroFrom} 0%, rgba(255,248,243,0.9) 48%, ${SURFACE.canvas} 100%)`,
].join(", ");
export const CHROME_BORDER = SURFACE.border;
export const CHROME_GLASS_SX = {
  backgroundColor: "rgba(255,248,243,0.72)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72)",
} as const;
export const CANVAS_BG = [
  `radial-gradient(920px 420px at 100% -8%, ${SURFACE.heroTo} 0%, transparent 58%)`,
  `radial-gradient(640px 280px at -8% 108%, ${SURFACE.heroMid}66 0%, transparent 52%)`,
  `linear-gradient(180deg, ${SURFACE.heroFrom} 0%, ${SURFACE.canvas} 52%, #F3EBE4 100%)`,
].join(", ");

export const GLASS_SX = {
  backgroundColor: "rgba(255,248,243,0.78)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: `1px solid ${SURFACE.border}`,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72), 0 10px 28px rgba(74, 52, 44, 0.04)",
} as const;
