import { Box, Typography } from "@mui/material";

import { GLASS_SX } from "../../constants/layout";
import { PageHeader } from "../ui/PageHeader";
import { ScreenFrame } from "../ui/ScreenFrame";

type PlaceholderPageProps = {
  title: string;
  description?: string;
};

export function PlaceholderPage({
  title,
  description = "This module will be built in a later sprint. The navigation is in place so the application shell stays complete.",
}: PlaceholderPageProps) {
  return (
    <ScreenFrame>
      <PageHeader eyebrow="Coming next" title={title} description={description} />
      <Box sx={{ ...GLASS_SX, p: 3, borderRadius: 1, maxWidth: 640 }}>
        <Typography color="text.secondary">
          Charts and workflows for this screen will land here. The glass shell is already in place.
        </Typography>
      </Box>
    </ScreenFrame>
  );
}
