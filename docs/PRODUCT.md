# AI Growth OS — Product & Module Guide

AI Growth is a multi-tenant workspace for agencies and brands:

**Project → Brand Kit → AI Content → Approval → Calendar → Publish → Leads → CRM**

Each organization can run many projects. Each project keeps its own social accounts, content, leads, and pipeline.

---

## 1. Product hierarchy

```text
SUPER ADMIN  (platform)
   └── ORGANIZATION  (customer company / agency)
         └── PROJECT  (brand, product, or client)
               ├── Social accounts
               ├── Brand kit
               ├── AI content
               ├── Calendar / publishing
               ├── Leads
               └── CRM
```

- **Super Admin** manages all companies. Public signup cannot create this role.
- **Organization Admin** sees every project and can add projects.
- **User** only sees assigned projects (example: Social Manager → Product A Instagram).

A **project** is one isolated workspace for a brand, product, or client.

---

## 2. Design language

The UI is product-first: coral actions, a dark sidebar, and a light workspace.

- **Primary:** coral `#FF5A3D`
- **Sidebar:** navy `#141921`
- **Canvas:** warm cream `#F6F1EA`
- **Type:** Fraunces for titles, Plus Jakarta Sans for UI

---

## 3. Module-by-module roadmap

Build in this order. Do not start the next module until the current one is usable.

### Module 0 — Foundation (done)

- React + TypeScript + Vite + MUI
- Auth: login, signup, Super Admin login
- RBAC and project assignment
- Organization / Super Admin shells
- Axios client (backend later)

### Module 1 — Projects (done, keep improving)

**Admin can:**

- See all projects on the dashboard
- Add a project
- Open a project workspace
- Enable modules: Social, Marketing, Leads, CRM

**User can:**

- See only assigned projects
- Switch project from the header

**Data:** `organization_id`, name, industry, modules, assigned users

### Module 2 — Brand Kit

**Screen:** `/app/brand-kit`

Per project, store:

- Brand voice / tone
- Language
- Target audience
- Primary / secondary colors
- Content pillars
- Banned words / compliance notes
- Example posts

Every AI generation must read this kit. Never prompt “write an Instagram post” without brand context.

### Module 3 — Social accounts

**Screen:** `/app/social/accounts`

Connect (OAuth via backend only):

- Instagram, Facebook
- YouTube
- LinkedIn
- Google Business Profile
- WhatsApp (messaging, not “posting”)
- TikTok

Store encrypted tokens on the **backend**. Frontend only shows status.

### Module 4 — Content Studio

**Screen:** `/app/social/content`

User flow:

1. Choose format: post, carousel, reel, short, video, story, or blog
2. Pick the channel
3. Describe the brief
4. AI generates caption, hook, script/outline, and CTA
5. Save draft, submit for approval, or schedule

V1 can mock generation. V2 calls NestJS → Gemini/OpenAI.

### Module 5 — Approval

Statuses: `draft → in_review → approved → scheduled → published → rejected`

Roles:

- Creator submits
- Admin / content manager approves
- Publisher cannot skip approval if the project is in Approval mode

Modes later: Full Auto / Approval / Strict (multi-step).

### Module 6 — Calendar, Inbox, Publisher

**Screens:** `/app/social/calendar`, `/app/social/inbox`, `/app/social/media`

- Week calendar for posts, reels, shorts, videos, and blogs
- Suggested send times per channel
- Unified inbox for comments, mentions, and messages
- Media library for creative
- Publishing engine is separate from AI

Publish adapters: Meta, YouTube, GBP, LinkedIn.

### Module 7 — AI Agents

**Screen:** `/app/ai-agents`

V1 agents:

| Agent | Job |
|---|---|
| Research | Company / trend research |
| Content | Strategy + captions |
| Creative | Image / video brief |
| Compliance | Banned claims / brand rules |
| Lead | Scoring + personalization |

Show a run timeline: understanding brand → research → draft → compliance → waiting for approval.

### Module 8 — Leads

**Screens:** `/app/leads`, `/app/leads/discover`

- Lead list with score
- Source (Apollo, form, social, import)
- Deduplicate by email/domain
- Enrichment fields
- Discover: search filters (industry, location, title)

Do not scrape unofficially. Use official APIs / n8n / Apify where allowed.

### Module 9 — CRM

**Screen:** `/app/crm`

Pipeline stages:

`New → Contacted → Meeting → Proposal → Won / Lost`

- Deal cards
- Contact + company
- Activity notes
- Task (follow-up)

Keep CRM **inside the project** so Client A never sees Client B.

### Module 10 — Inbox / WhatsApp

Later: unified inbox for WhatsApp, IG DM, SMS. Not a social posting channel.

### Module 11 — Analytics loop

Pull impressions, clicks, comments → store metrics → suggest next content mix.

### Module 12 — Billing, usage limits, white-label

Plans, AI credits, extra video cost, agency client portals.

---

## 4. Feature map

### CRM & sales

- Contacts, companies, deals
- Lead scoring
- Forms → CRM
- Email sequences (later)
- Pipeline + tasks
- Permissions
- AI that uses CRM data

### Agency operations

- Multi-project isolation
- Social calendar
- Funnels/pages (later)
- Workflows / n8n
- Booking (later)
- Snapshots (clone a project)
- White-label (later)

### Content & AI

- Brand kit
- Content studio
- Agents
- Content pipelines
- Image generation
- Search/answer optimization later

---

## 5. What not to build in V1

- Custom LLM / image / video models
- Unofficial LinkedIn or Instagram scraping
- 20 social networks
- Fully autonomous posting
- Full Salesforce replacement
- Voice agents
- Memberships / courses
- CPQ / complex billing

---

## 6. Frontend vs backend

| Layer | Owns |
|---|---|
| React | UI, forms, permissions display, project switcher |
| NestJS | Auth, tenancy, OAuth tokens, RBAC enforcement, AI calls |
| PostgreSQL | All business data with `organization_id` + `project_id` |
| Redis + BullMQ | Jobs, scheduling, retries |
| n8n | External workflows (Apollo, enrichment, notifications) |
| S3 | Images, videos, exports |

Never put API secrets in React (`VITE_` is public).

---

## 7. Current frontend screens

| Route | Module |
|---|---|
| `/login` `/signup` `/admin/login` | Auth |
| `/app/dashboard` | Home + all projects |
| `/app/projects` | Project list |
| `/app/projects/:id` | Project hub |
| `/app/brand-kit` | Brand Kit |
| `/app/social/accounts` | Connected accounts |
| `/app/social/content` | Content Studio (posts, reels, shorts, video, blogs) |
| `/app/social/calendar` | Publishing calendar |
| `/app/social/inbox` | Comments, mentions, messages |
| `/app/social/approvals` | Content review |
| `/app/social/campaigns` | Campaign groups |
| `/app/social/analytics` | Channel performance |
| `/app/social/media` | Creative library |
| `/app/leads` | Lead inbox |
| `/app/crm` | Pipeline |
| `/app/ai-agents` | Agent workforce |
| `/super-admin` | Platform control |

---

## 8. Demo logins (frontend mock)

Password for all: `Password123!`

| Role | Email |
|---|---|
| Super Admin | emma.t@example.net |
| Organization Admin | zoe.m@example.net |
| Social Manager (Product A only) | uma.s@example.org |

---

## 9. Build rule

One module at a time:

1. Screen works for the current project
2. Admin vs user permissions are visible
3. Data is scoped to `project_id`
4. Then connect NestJS

Do not add a new social network or a new AI model until the current module’s workflow is complete.
