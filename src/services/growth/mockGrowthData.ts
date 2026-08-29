export type LeadStatus = "new" | "qualified" | "contacted" | "lost";

export type Lead = {
  id: string;
  projectId: string;
  name: string;
  company: string;
  title: string;
  score: number;
  status: LeadStatus;
  source: string;
};

export type DealStage = "new" | "contacted" | "meeting" | "won";

export type Deal = {
  id: string;
  projectId: string;
  name: string;
  company: string;
  value: string;
  stage: DealStage;
};

export function getLeads(projectId: string): Lead[] {
  return [
    {
      id: `${projectId}-l1`,
      projectId,
      name: "Sneha Kulkarni",
      company: "Nova Clinics",
      title: "Marketing Head",
      score: 86,
      status: "qualified",
      source: "Discovery",
    },
    {
      id: `${projectId}-l2`,
      projectId,
      name: "Prakash Patil",
      company: "Pune Motors",
      title: "Founder",
      score: 74,
      status: "new",
      source: "Instagram",
    },
    {
      id: `${projectId}-l3`,
      projectId,
      name: "Meera Shah",
      company: "Atlas Insurance",
      title: "Branch Manager",
      score: 91,
      status: "contacted",
      source: "Apollo",
    },
    {
      id: `${projectId}-l4`,
      projectId,
      name: "Imran Khan",
      company: "Bright Homes",
      title: "Sales Director",
      score: 62,
      status: "new",
      source: "Form",
    },
  ];
}

export function getDeals(projectId: string): Deal[] {
  return [
    {
      id: `${projectId}-d1`,
      projectId,
      name: "Health plan bundle",
      company: "Nova Clinics",
      value: "₹2.4L",
      stage: "meeting",
    },
    {
      id: `${projectId}-d2`,
      projectId,
      name: "Agency retainer",
      company: "Pune Motors",
      value: "₹90k",
      stage: "contacted",
    },
    {
      id: `${projectId}-d3`,
      projectId,
      name: "Term plan campaign",
      company: "Atlas Insurance",
      value: "₹4.1L",
      stage: "new",
    },
    {
      id: `${projectId}-d4`,
      projectId,
      name: "Annual content OS",
      company: "Bright Homes",
      value: "₹6.0L",
      stage: "won",
    },
  ];
}
