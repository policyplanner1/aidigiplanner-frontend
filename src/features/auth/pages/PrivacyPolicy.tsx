import { Box, Typography } from "@mui/material";

import { TYPE } from "../../../constants/fonts";

export function PrivacyPolicyPage() {
  return (
    <Box>
      <Typography sx={{ ...TYPE.eyebrow, color: "secondary.dark" }}>Legal</Typography>
      <Typography variant="h5" sx={{ ...TYPE.title, mt: 0.75, fontSize: "1.45rem" }}>
        Privacy Policy
      </Typography>
      <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 1.5 }}>
        AI Social Planner stores the account, company, brand, content, and social-connection
        data you provide so we can run the product for you. We don't sell your data, and we
        only share it with the AI and storage providers required to generate and publish your
        content. You can request export or deletion of your company's data at any time by
        contacting your account administrator.
      </Typography>
      <Typography sx={{ ...TYPE.body, color: "text.secondary", mt: 1.5 }}>
        This is placeholder policy text for the product preview — replace it with your
        organization's reviewed privacy policy before launch.
      </Typography>
    </Box>
  );
}
