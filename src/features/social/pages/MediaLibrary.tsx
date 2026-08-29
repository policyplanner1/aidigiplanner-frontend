import { FilterList, GridView, Image, Movie, Search, ViewList } from "@mui/icons-material";
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";

import { PageHeader } from "../../../components/ui/PageHeader";
import { NeedProject } from "../../../components/ui/NeedProject";
import { ScreenFrame } from "../../../components/ui/ScreenFrame";
import { GLASS_SX, SURFACE } from "../../../constants/layout";
import { TYPE } from "../../../constants/fonts";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { getMediaAssets, getSocialPosts } from "../../../services/social/publishingService";
import { handleFromName, mediaTone, PlatformMark } from "../components/PlatformMark";

export function MediaLibraryPage() {
  const { currentProject } = useWorkspace();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const posts = getSocialPosts(currentProject?.id ?? "none");
  const assets = getMediaAssets(currentProject?.id ?? "none");

  const cards = useMemo(() => {
    const fromPosts = posts.map((post) => ({
      id: post.id,
      platform: post.platform,
      caption: post.caption,
      time: `${post.day} ${post.time}`,
      kind: post.format === "reel" || post.format === "short" || post.format === "video" ? "video" : "image",
      bubble: post.platform === "Facebook",
    }));
    const fromAssets = assets.map((asset) => ({
      id: asset.id,
      platform: "Instagram",
      caption: `${asset.name} · ${asset.detail}`,
      time: asset.detail,
      kind: asset.kind,
      bubble: false,
    }));
    const merged = [...fromPosts, ...fromAssets];
    const q = query.trim().toLowerCase();
    return q ? merged.filter((item) => item.caption.toLowerCase().includes(q)) : merged;
  }, [posts, assets, query]);

  if (!currentProject) {
    return <NeedProject feature="Media" />;
  }

  const handle = handleFromName(currentProject.name);

  return (
    <ScreenFrame>
      <Box sx={{ display: "grid", gap: 2 }}>
        <PageHeader
          eyebrow="Publishing"
          title="Media library"
          description={`Lifetime activity on posts for ${currentProject.name}.`}
        />
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button startIcon={<FilterList />} sx={{ borderRadius: "999px", color: "text.secondary" }}>
            Filters
          </Button>
          <IconButton onClick={() => setView("list")} sx={{ color: view === "list" ? "secondary.dark" : "text.secondary" }}>
            <ViewList />
          </IconButton>
          <IconButton onClick={() => setView("grid")} sx={{ color: view === "grid" ? "secondary.dark" : "text.secondary" }}>
            <GridView />
          </IconButton>
          <TextField
            size="small"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search posts..."
            slotProps={{ input: { startAdornment: <Search fontSize="small" sx={{ mr: 1, color: "text.secondary" }} /> } }}
            sx={{ maxWidth: 320, "& .MuiOutlinedInput-root": { borderRadius: "999px", backgroundColor: "rgba(255,248,243,0.88)" } }}
          />
          <Typography sx={{ ...TYPE.label, color: "text.secondary", ml: "auto" }}>{cards.length} posts</Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: view === "list" ? "1fr" : { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
          }}
        >
          {cards.map((card) => (
            <Box key={card.id} sx={{ ...GLASS_SX, borderRadius: "12px", overflow: "hidden", backgroundColor: "#FFFBF8" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, pt: 1.25 }}>
                <PlatformMark platform={card.platform} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ ...TYPE.label, fontSize: 12 }} noWrap>
                    {handle}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {card.time}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ p: 1.5 }}>
                {card.bubble ? (
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: "12px",
                      border: `1px solid ${SURFACE.border}`,
                      backgroundColor: "rgba(255,248,243,0.9)",
                    }}
                  >
                    <Typography variant="body2">{card.caption}</Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ mb: 1.25, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {card.caption}
                  </Typography>
                )}
                <Box
                  sx={{
                    position: "relative",
                    mt: 1.25,
                    height: 150,
                    borderRadius: "10px",
                    background: `linear-gradient(145deg, ${mediaTone(card.kind)}33, ${SURFACE.heroMid})`,
                    display: "grid",
                    placeItems: "center",
                    color: mediaTone(card.kind),
                  }}
                >
                  {card.kind === "video" ? <Movie /> : <Image />}
                  <Box
                    sx={{
                      position: "absolute",
                      left: 8,
                      bottom: 8,
                      width: 28,
                      height: 28,
                      borderRadius: "6px",
                      backgroundColor: "rgba(74,52,44,0.55)",
                      color: "#FFF9F5",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {card.kind === "video" ? <Movie sx={{ fontSize: 16 }} /> : <Image sx={{ fontSize: 16 }} />}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </ScreenFrame>
  );
}
