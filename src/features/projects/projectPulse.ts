import { getLeads } from "../../services/growth/mockGrowthData";
import { getSocialAccounts } from "../../services/projects/projectService";
import {
  getInboxItems,
  getSocialPosts,
} from "../../services/social/publishingService";

export type ProjectPulse = {
  connected: number;
  scheduled: number;
  inbox: number;
  leads: number;
};

export function getProjectPulse(projectId: string): ProjectPulse {
  const posts = getSocialPosts(projectId);
  const inbox = getInboxItems(projectId);
  const leads = getLeads(projectId);
  const accounts = getSocialAccounts(projectId);

  return {
    connected: accounts.filter((item) => item.status === "connected").length,
    scheduled: posts.filter((item) => item.status === "scheduled").length,
    inbox: inbox.filter((item) => item.status === "open").length,
    leads: leads.filter((item) => item.status === "new" || item.status === "qualified").length,
  };
}
