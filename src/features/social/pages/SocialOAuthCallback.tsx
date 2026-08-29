import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function SocialOAuthCallbackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const next = new URLSearchParams(params);
    navigate(`/app/social/accounts?${next.toString()}`, { replace: true });
  }, [navigate, params]);

  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: 240, gap: 1.5 }}>
      <CircularProgress size={22} />
      <Typography color="text.secondary">Finishing connection…</Typography>
    </Box>
  );
}
