import { Box, Typography } from "@mui/material";

import { TYPE } from "../../../constants/fonts";

export function TermsPage() {
  return (
    <Box>
      <Typography sx={{ ...TYPE.eyebrow, color: "secondary.dark" }}>Legal</Typography>
      <Typography variant="h5" sx={{ ...TYPE.title, mt: 0.75, fontSize: "1.45rem" }}>
        Terms of Service
      </Typography>
      <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 1.5 }}>
        By creating a company account on AI Social Planner you agree to use the platform to
        plan, generate, review, and publish content for products you're authorized to represent.
        You're responsible for the accuracy of the content you approve and publish, and for
        keeping your team's access up to date.
      </Typography>
      <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 1.5 }}>
        This is placeholder terms text for the product preview — replace it with your
        organization's reviewed terms of service before launch.
      </Typography>
    </Box>
  );
}
