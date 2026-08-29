import { Box } from "@mui/material";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { TYPE } from "../../constants/fonts";
import { SURFACE } from "../../constants/layout";

type CapsuleFilterItem<T extends string> = {
  id: T;
  label: string;
};

type CapsuleFilterProps<T extends string> = {
  items: readonly CapsuleFilterItem<T>[];
  value: T;
  onChange: (id: T) => void;
};

export function CapsuleFilter<T extends string>({
  items,
  value,
  onChange,
}: CapsuleFilterProps<T>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<T, HTMLButtonElement | null>>>({});
  const [thumb, setThumb] = useState({ left: 4, width: 0 });

  const moveThumb = useCallback(() => {
    const track = trackRef.current;
    const tab = tabRefs.current[value];
    if (!track || !tab) return;
    const trackBox = track.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    setThumb({
      left: tabBox.left - trackBox.left,
      width: tabBox.width,
    });
  }, [value]);

  useLayoutEffect(() => {
    moveThumb();
    window.addEventListener("resize", moveThumb);
    return () => window.removeEventListener("resize", moveThumb);
  }, [moveThumb, items]);

  return (
    <Box
      ref={trackRef}
      role="tablist"
      sx={{
        position: "relative",
        display: "inline-flex",
        flexShrink: 0,
        alignItems: "center",
        p: "4px",
        borderRadius: "999px",
        backgroundColor: "rgba(255,248,243,0.88)",
        border: `1px solid ${SURFACE.border}`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
        overflowX: "auto",
        maxWidth: "100%",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "4px",
          bottom: "4px",
          left: 0,
          width: thumb.width,
          transform: `translateX(${thumb.left}px)`,
          borderRadius: "999px",
          backgroundColor: "#1F8A80",
          boxShadow: "0 6px 14px rgba(31,138,128,0.28)",
          transition: "transform 0.28s ease, width 0.28s ease",
          pointerEvents: "none",
        }}
      />
      {items.map((item) => {
        const active = item.id === value;
        return (
          <Box
            key={item.id}
            component="button"
            type="button"
            role="tab"
            aria-selected={active}
            ref={(node: HTMLButtonElement | null) => {
              tabRefs.current[item.id] = node;
            }}
            onClick={() => onChange(item.id)}
            sx={{
              position: "relative",
              zIndex: 1,
              appearance: "none",
              border: 0,
              background: "transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
              px: 1.75,
              py: 0.7,
              borderRadius: "999px",
              color: active ? "#F4FFFD" : "text.primary",
              ...TYPE.label,
              fontSize: 13,
              fontWeight: active ? 700 : 600,
              transition: "color 0.2s ease",
            }}
          >
            {item.label}
          </Box>
        );
      })}
    </Box>
  );
}
