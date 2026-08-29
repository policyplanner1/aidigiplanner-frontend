import { Box, TextField } from "@mui/material";
import { useEffect, useState } from "react";

import { TYPE } from "../../constants/fonts";
import { SURFACE } from "../../constants/layout";

type AnimatedSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  phrases: string[];
  prefix?: string;
  "aria-label"?: string;
};

function remainder(phrase: string, prefix: string) {
  const trimmed = phrase.trim();
  if (trimmed.toLowerCase().startsWith(prefix.toLowerCase())) {
    return trimmed.slice(prefix.length).trimStart();
  }
  return trimmed;
}

export function AnimatedSearchField({
  value,
  onChange,
  phrases,
  prefix = "Search",
  "aria-label": ariaLabel,
}: AnimatedSearchFieldProps) {
  const [index, setIndex] = useState(0);
  const [chars, setChars] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const idle = value.length > 0;
  const phrase = remainder(phrases[index] ?? phrases[0] ?? "", prefix);

  useEffect(() => {
    if (idle) return;
    const doneTyping = chars === phrase.length;
    const delay = deleting ? 36 : doneTyping ? 1600 : 72;
    const timer = window.setTimeout(() => {
      if (!deleting && doneTyping) {
        setDeleting(true);
        return;
      }
      if (deleting && chars === 0) {
        setDeleting(false);
        setIndex((current) => (current + 1) % phrases.length);
        return;
      }
      setChars((current) => current + (deleting ? -1 : 1));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [chars, deleting, idle, phrase.length, phrases.length]);

  return (
    <Box
      sx={{
        position: "relative",
        width: 240,
        minWidth: 240,
        flex: "0 0 240px",
        zIndex: 1,
      }}
    >
      <TextField
        size="small"
        fullWidth
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel ?? `${prefix} ${phrase}`.trim()}
        placeholder=" "
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "999px",
            backgroundColor: "rgba(255,248,243,0.88)",
            "& fieldset": { borderColor: SURFACE.border },
            "&:hover fieldset": { borderColor: SURFACE.border },
            "&.Mui-focused fieldset": { borderColor: "#1F8A80" },
          },
        }}
      />
      {idle ? null : (
        <Box
          aria-hidden
          sx={{
            ...TYPE.body,
            position: "absolute",
            left: 14,
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: "text.secondary",
            fontSize: 13,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {prefix}
          {phrase ? (
            <>
              {" "}
              {phrase.slice(0, chars)}
            </>
          ) : null}
          <Box
            component="span"
            sx={{
              ml: 0.15,
              color: "secondary.main",
              animation: "searchCaret 1s step-end infinite",
              "@keyframes searchCaret": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0 },
              },
            }}
          >
            |
          </Box>
        </Box>
      )}
    </Box>
  );
}
