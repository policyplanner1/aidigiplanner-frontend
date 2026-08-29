import { Box } from "@mui/material";
import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

import { TYPE } from "../../../constants/fonts";
import { SURFACE } from "../../../constants/layout";

type OtpBoxesProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function OtpBoxes({ value, onChange, disabled }: OtpBoxesProps) {
  const digits = value.padEnd(6, " ").slice(0, 6).split("");
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const setDigit = (index: number, digit: string) => {
    const next = value.split("");
    while (next.length < 6) next.push("");
    next[index] = digit;
    onChange(next.join("").slice(0, 6));
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index]?.trim() && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 5) refs.current[index + 1]?.focus();
  };

  return (
    <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
      {digits.map((digit, index) => (
        <Box
          key={index}
          component="input"
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoFocus={index === 0}
          maxLength={1}
          disabled={disabled}
          value={digit.trim()}
          ref={(node: HTMLInputElement | null) => {
            refs.current[index] = node;
          }}
          onPaste={onPaste}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => onKeyDown(index, event)}
          onChange={(event: { target: { value: string } }) => {
            const next = event.target.value.replace(/\D/g, "").slice(-1);
            setDigit(index, next);
            if (next && index < 5) refs.current[index + 1]?.focus();
          }}
          sx={{
            ...TYPE.metric,
            width: 48,
            height: 56,
            textAlign: "center",
            fontSize: 22,
            borderRadius: "10px",
            border: `1px solid ${SURFACE.border}`,
            backgroundColor: "rgba(255,248,243,0.9)",
            color: "text.primary",
            outline: "none",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease",
            "&:focus": {
              borderColor: "#1F8A80",
              boxShadow: "0 0 0 3px rgba(31,138,128,0.18)",
              transform: "translateY(-1px)",
            },
          }}
        />
      ))}
    </Box>
  );
}
