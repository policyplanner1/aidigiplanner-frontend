// System content templates (spec §19 "Manage system templates") have no
// backend entity — local/mock store, same pattern as Campaigns and Brand Library.

export type SystemTemplate = {
  id: string;
  name: string;
  format: "post" | "carousel" | "reel" | "story" | "video" | "blog";
  industry: string;
  prompt: string;
  active: boolean;
};

const KEY = "ai-growth-admin-templates";

const SEED: SystemTemplate[] = [
  {
    id: "tmpl_1",
    name: "Product launch announcement",
    format: "post",
    industry: "General",
    prompt: "Announce a new product/feature with a clear benefit and a single CTA.",
    active: true,
  },
  {
    id: "tmpl_2",
    name: "Myth vs fact carousel",
    format: "carousel",
    industry: "Insurance",
    prompt: "Bust a common myth in 4-5 slides, ending with a CTA to learn more.",
    active: true,
  },
  {
    id: "tmpl_3",
    name: "Quick explainer reel",
    format: "reel",
    industry: "General",
    prompt: "15-20s hook + one clear answer + CTA, in a friendly, fast-paced tone.",
    active: true,
  },
];

function read(): SystemTemplate[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(SEED));
    return SEED;
  }
  try {
    return JSON.parse(raw) as SystemTemplate[];
  } catch {
    return SEED;
  }
}

function write(templates: SystemTemplate[]) {
  localStorage.setItem(KEY, JSON.stringify(templates));
}

export function listTemplates(): SystemTemplate[] {
  return read();
}

export function saveTemplate(input: Omit<SystemTemplate, "id"> & { id?: string }): SystemTemplate {
  const templates = read();
  const template: SystemTemplate = { ...input, id: input.id ?? `tmpl_${Date.now()}` };
  const next = templates.some((item) => item.id === template.id)
    ? templates.map((item) => (item.id === template.id ? template : item))
    : [template, ...templates];
  write(next);
  return template;
}

export function deleteTemplate(id: string) {
  write(read().filter((item) => item.id !== id));
}
