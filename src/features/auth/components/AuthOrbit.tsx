import { Box } from "@mui/material";

import { FONT_FAMILY } from "../../../constants/fonts";

const SIZE = 640;
const C = SIZE / 2;

const labels = [
  { text: "Social", accent: "#FF6B45", radius: 98, duration: "16s", start: 0 },
  { text: "Content", accent: "#1F8A80", radius: 156, duration: "22s", start: 90 },
  { text: "Leads", accent: "#FF6B45", radius: 214, duration: "30s", start: 180 },
  { text: "CRM", accent: "#1F8A80", radius: 272, duration: "38s", start: 270 },
] as const;

export function AuthOrbit() {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        maxWidth: 640,
        maxHeight: "100%",
        aspectRatio: "1 / 1",
        mx: "auto",
      }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        sx={{ width: "100%", height: "100%", overflow: "visible", display: "block" }}
      >
        <defs>
          <radialGradient id="adp-sun" cx="34%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFE0D0" />
            <stop offset="42%" stopColor="#FF6B45" />
            <stop offset="100%" stopColor="#E25030" />
          </radialGradient>
          <filter id="adp-shine" x="-90%" y="-90%" width="280%" height="280%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {labels.map((item) => (
          <circle
            key={`${item.text}-path`}
            cx={C}
            cy={C}
            r={item.radius}
            fill="none"
            stroke={item.accent}
            strokeOpacity="0.28"
            strokeWidth="1.35"
          />
        ))}

        {labels.map((item) => {
          const x = C;
          const y = C - item.radius;

          return (
            <g key={item.text}>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`${item.start} ${C} ${C}`}
                to={`${item.start + 360} ${C} ${C}`}
                dur={item.duration}
                repeatCount="indefinite"
              />
              <g>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`${-item.start} ${x} ${y}`}
                  to={`${-item.start - 360} ${x} ${y}`}
                  dur={item.duration}
                  repeatCount="indefinite"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={item.accent}
                  fontFamily={FONT_FAMILY}
                  fontSize="18"
                  fontWeight="700"
                  stroke="#FFF8F3"
                  strokeWidth="6"
                  paintOrder="stroke"
                  strokeLinejoin="round"
                >
                  {item.text}
                </text>
              </g>
            </g>
          );
        })}

        <circle cx={C} cy={C} r="62" fill="#FF6B45" opacity="0.16" filter="url(#adp-shine)" />
        <circle cx={C} cy={C} r="46" fill="url(#adp-sun)" />
        <text
          x={C}
          y={C}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#FFF9F5"
          fontFamily={FONT_FAMILY}
          fontSize="22"
          fontWeight="800"
        >
          AI
        </text>
      </Box>
    </Box>
  );
}
