import {
  ArticleOutlined,
  BurstModeOutlined,
  CampaignOutlined,
  CheckCircle,
  MovieFilterOutlined,
  PhotoOutlined,
  PlayCircleOutlined,
  VideocamOutlined,
  ViewCarouselOutlined,
} from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import { useCallback, useLayoutEffect, useRef, useState, type ReactNode, type SVGProps } from "react";

import { TYPE } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";
import { CONTENT_FORMATS, type ContentFormatId } from "../../../constants/contentFormats";
import { PlatformMark } from "../../social/components/PlatformMark";

const STAGE_GLASS = {
  backgroundColor: "rgba(246, 238, 230, 0.55)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: `1px solid ${SURFACE.border}`,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.48), 0 10px 28px rgba(74, 52, 44, 0.04)",
} as const;

type StepId = "formats" | "channels" | "studio";

const STEPS: { id: StepId; label: string; hint: string }[] = [
  { id: "formats", label: "Formats", hint: "What to make" },
  { id: "channels", label: "Channels", hint: "Where it goes" },
  { id: "studio", label: "Studio", hint: "Write & generate" },
];

const FORMAT_ICONS: Record<ContentFormatId, typeof PhotoOutlined> = {
  post: PhotoOutlined,
  carousel: ViewCarouselOutlined,
  reel: MovieFilterOutlined,
  short: PlayCircleOutlined,
  video: VideocamOutlined,
  story: BurstModeOutlined,
  campaign: CampaignOutlined,
  blog: ArticleOutlined,
};

const FORMAT_ACCENT: Record<ContentFormatId, string> = {
  post: "#FF6B45",
  carousel: "#1F8A80",
  reel: "#FF6B45",
  short: "#1F8A80",
  video: "#E8A838",
  story: "#FF6B45",
  campaign: "#7C5CFC",
  blog: "#1F8A80",
};

type StudioStepperProps = {
  step: StepId;
  onStep: (id: StepId) => void;
  formatsReady: boolean;
  channelsReady: boolean;
};

export function StudioStepper({ step, onStep, formatsReady, channelsReady }: StudioStepperProps) {
  const index = STEPS.findIndex((item) => item.id === step);
  const trackRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<StepId, HTMLButtonElement | null>>>({});
  const [thumb, setThumb] = useState({ left: 8, top: 8, width: 0, height: 0 });
  const [ready, setReady] = useState(false);

  const moveThumb = useCallback(() => {
    const track = trackRef.current;
    const tab = tabRefs.current[step];
    if (!track || !tab) return;
    const trackBox = track.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    setThumb({
      left: tabBox.left - trackBox.left,
      top: tabBox.top - trackBox.top,
      width: tabBox.width,
      height: tabBox.height,
    });
  }, [step]);

  useLayoutEffect(() => {
    moveThumb();
    setReady(true);
    const track = trackRef.current;
    const observer = track ? new ResizeObserver(moveThumb) : null;
    if (track) observer?.observe(track);
    window.addEventListener("resize", moveThumb);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", moveThumb);
    };
  }, [moveThumb, formatsReady, channelsReady]);

  return (
    <Box
      ref={trackRef}
      role="tablist"
      sx={{
        ...STAGE_GLASS,
        position: "relative",
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 0.75,
        p: 0.75,
        borderRadius: "20px",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: thumb.width,
          height: thumb.height,
          transform: `translate(${thumb.left}px, ${thumb.top}px)`,
          borderRadius: "16px",
          background: "linear-gradient(135deg, rgba(255,107,69,0.16) 0%, rgba(246,238,230,0.42) 46%, rgba(31,138,128,0.16) 100%)",
          border: `1px solid ${SURFACE.border}`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.42)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          opacity: ready ? 1 : 0,
          transition: ready
            ? "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), width 0.45s cubic-bezier(0.22, 1, 0.36, 1), height 0.45s cubic-bezier(0.22, 1, 0.36, 1)"
            : "none",
          pointerEvents: "none",
        }}
      />
      {STEPS.map((item, itemIndex) => {
        const active = item.id === step;
        const done =
          (item.id === "formats" && formatsReady && index > 0) ||
          (item.id === "channels" && channelsReady && index > 1) ||
          (item.id === "studio" && index === 2 && formatsReady && channelsReady);
        const locked =
          (item.id === "channels" && !formatsReady) || (item.id === "studio" && (!formatsReady || !channelsReady));

        return (
          <Box
            key={item.id}
            component="button"
            type="button"
            role="tab"
            aria-selected={active}
            disabled={locked}
            ref={(node: HTMLButtonElement | null) => {
              tabRefs.current[item.id] = node;
            }}
            onClick={() => onStep(item.id)}
            sx={{
              position: "relative",
              zIndex: 1,
              appearance: "none",
              border: 0,
              background: "transparent",
              textAlign: "left",
              cursor: locked ? "not-allowed" : "pointer",
              borderRadius: "16px",
              px: { xs: 1.1, sm: 1.75 },
              py: 1.35,
              color: "text.primary",
              opacity: locked ? 0.4 : 1,
            }}
          >
            <Typography sx={{ ...TYPE.eyebrow, color: active ? "primary.main" : "secondary.dark", fontSize: 10 }}>
              Step {itemIndex + 1}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.35, minHeight: 22 }}>
              <CheckCircle sx={{ fontSize: 16, color: "#1F8A80", opacity: done && !active ? 1 : 0 }} />
              <Typography sx={{ fontWeight: 800, fontSize: { xs: 13, sm: 15 } }}>{item.label}</Typography>
            </Box>
            <Typography sx={{ mt: 0.2, fontSize: 12, color: "text.secondary", display: { xs: "none", sm: "block" } }}>
              {item.hint}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export function StudioStage({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        ...STAGE_GLASS,
        p: { xs: 2.25, md: 3 },
        borderRadius: "20px",
      }}
    >
      {children}
    </Box>
  );
}

type ChoiceCardProps = {
  selected: boolean;
  title: string;
  hint: string;
  accent: string;
  icon: ReactNode;
  onClick: () => void;
};

function ChoiceCard({ selected, title, hint, accent, icon, onClick }: ChoiceCardProps) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      sx={{
        ...STAGE_GLASS,
        appearance: "none",
        textAlign: "left",
        cursor: "pointer",
        p: 2,
        minHeight: 132,
        borderRadius: "18px",
        border: "1.5px solid",
        borderColor: selected ? accent : SURFACE.border,
        background: selected
          ? `linear-gradient(180deg, ${accent}1F 0%, rgba(246,238,230,0.5) 78%)`
          : "rgba(246, 238, 230, 0.42)",
        boxShadow: selected ? `inset 0 1px 0 rgba(255,255,255,0.4), 0 10px 22px ${accent}18` : STAGE_GLASS.boxShadow,
        transform: selected ? "translateY(-3px)" : "none",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: accent,
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "12px",
            display: "grid",
            placeItems: "center",
            backgroundColor: `${accent}18`,
            color: accent,
          }}
        >
          {icon}
        </Box>
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: "1.5px solid",
            borderColor: selected ? accent : SURFACE.border,
            backgroundColor: selected ? accent : "transparent",
            display: "grid",
            placeItems: "center",
          }}
        >
          {selected ? (
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#FFF9F5" }} />
          ) : null}
        </Box>
      </Box>
      <Typography sx={{ mt: 1.5, fontWeight: 800, fontSize: 16 }}>{title}</Typography>
      <Typography sx={{ mt: 0.4, color: "text.secondary", fontSize: 13, lineHeight: 1.4 }}>{hint}</Typography>
    </Box>
  );
}

type FormatPickerProps = {
  selected: ContentFormatId[];
  onToggle: (id: ContentFormatId) => void;
  onNext: () => void;
};

export function FormatPicker({ selected, onToggle, onNext }: FormatPickerProps) {
  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" },
        }}
      >
        {CONTENT_FORMATS.map((item) => {
          const Icon = FORMAT_ICONS[item.id];
          return (
            <ChoiceCard
              key={item.id}
              selected={selected.includes(item.id)}
              title={item.label}
              hint={item.hint}
              accent={FORMAT_ACCENT[item.id]}
              icon={<Icon />}
              onClick={() => onToggle(item.id)}
            />
          );
        })}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2.5, gap: 2, flexWrap: "wrap" }}>
        <Typography color="text.secondary">
          {selected.length ? `${selected.length} format${selected.length === 1 ? "" : "s"} selected` : "Select one or more formats"}
        </Typography>
        <Button variant="contained" disabled={selected.length === 0} onClick={onNext} sx={{ borderRadius: "999px", px: 3 }}>
          Continue to channels
        </Button>
      </Box>
    </Box>
  );
}

type ChannelPickerProps = {
  options: string[];
  selected: string[];
  onToggle: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export function ChannelPicker({ options, selected, onToggle, onBack, onNext }: ChannelPickerProps) {
  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" },
        }}
      >
        {options.map((item) => (
          <ChoiceCard
            key={item}
            selected={selected.includes(item)}
            title={item}
            hint="Publish this brief here"
            accent="#1F8A80"
            icon={<PlatformMark platform={item} size={22} />}
            onClick={() => onToggle(item)}
          />
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2.5, gap: 2, flexWrap: "wrap" }}>
        <Button onClick={onBack} sx={{ borderRadius: "999px" }}>
          Back to formats
        </Button>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: "auto", flexWrap: "wrap" }}>
          <Typography color="text.secondary">
            {selected.length ? `${selected.length} channel${selected.length === 1 ? "" : "s"} selected` : "Select one or more channels"}
          </Typography>
          <Button variant="contained" disabled={selected.length === 0} onClick={onNext} sx={{ borderRadius: "999px", px: 3 }}>
            Open Content Studio
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export function StudioSpark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" {...props}>
      <circle cx="32" cy="32" r="22" stroke="#FF6B45" strokeOpacity="0.35" />
      <circle cx="32" cy="32" r="10" fill="#FF6B45" />
      <text x="32" y="36" textAnchor="middle" fill="#FFF9F5" fontSize="9" fontWeight="800">
        AI
      </text>
    </svg>
  );
}

export type { StepId };
export { STAGE_GLASS };
