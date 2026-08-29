import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { TYPE } from "../../constants/fonts";

type AnimatedCountProps = {
  value: number;
  duration?: number;
  fontSize?: number;
  color?: string;
};

/** 4 → 04, 12 → 012: always one extra leading zero past the digit count. */
export function padCount(value: number, target = value) {
  const n = Math.max(0, Math.trunc(Number.isFinite(value) ? value : 0));
  const t = Math.max(0, Math.trunc(Number.isFinite(target) ? target : 0));
  const width = String(t).length + 1;
  return String(n).padStart(width, "0");
}

export function AnimatedCount({
  value,
  duration = 900,
  fontSize = 26,
  color,
}: AnimatedCountProps) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const to = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = fromRef.current;
    if (reduce || from === to) {
      fromRef.current = to;
      setDisplay(to);
      return;
    }

    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, to]);

  return (
    <Box
      component="span"
      sx={{
        ...TYPE.metric,
        fontSize,
        color,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "0.08em",
      }}
    >
      {padCount(display, to)}
    </Box>
  );
}
