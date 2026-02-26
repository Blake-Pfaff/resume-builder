import { z } from "zod";

export const SECTION_KEYS = [
  "header",
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "custom",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];
export type ResumeTemplate = "classic" | "modern";

export const resumeContentSchema = z.object({
  sectionOrder: z.array(z.enum(SECTION_KEYS)).default(SECTION_KEYS as unknown as [SectionKey, ...SectionKey[]]),
  sections: z.record(z.enum(SECTION_KEYS), z.boolean()),
  header: z.object({
    fullName: z.string(),
    jobTitle: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    linkedin: z.string(),
    github: z.string(),
    portfolio: z.string(),
  }),
  summary: z.string(),
  experience: z.array(
    z.object({
      id: z.string(),
      company: z.string(),
      role: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      location: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      id: z.string(),
      institution: z.string(),
      degree: z.string(),
      fieldOfStudy: z.string(),
      startYear: z.string(),
      endYear: z.string(),
      gpa: z.string().optional(),
      notes: z.string().optional(),
    }),
  ),
  skills: z.array(
    z.object({
      id: z.string(),
      group: z.string(),
      items: z.array(z.string()),
    }),
  ),
  projects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      url: z.string(),
      description: z.string(),
      techStack: z.array(z.string()),
      bullets: z.array(z.string()),
    }),
  ),
  certifications: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      issuer: z.string(),
      date: z.string(),
      credentialUrl: z.string(),
    }),
  ),
  custom: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      body: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
});

export type ResumeContent = z.infer<typeof resumeContentSchema>;

const createId = () => crypto.randomUUID();

export const createDefaultResumeContent = (): ResumeContent => ({
  sectionOrder: [...SECTION_KEYS],
  sections: {
    header: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    projects: true,
    certifications: true,
    custom: true,
  },
  header: {
    fullName: "Your Name",
    jobTitle: "Software Engineer",
    email: "you@example.com",
    phone: "(555) 555-5555",
    location: "City, ST",
    linkedin: "linkedin.com/in/you",
    github: "github.com/you",
    portfolio: "yourportfolio.com",
  },
  summary:
    "Impact-focused engineer with experience building reliable full-stack products and shipping features quickly.",
  experience: [
    {
      id: createId(),
      company: "Acme Inc",
      role: "Software Engineer",
      startDate: "2022-01",
      endDate: "Present",
      location: "Remote",
      bullets: [
        "Built and shipped user-facing features in React and TypeScript.",
        "Improved API response times by optimizing key endpoints.",
      ],
    },
  ],
  education: [
    {
      id: createId(),
      institution: "State University",
      degree: "B.S.",
      fieldOfStudy: "Computer Science",
      startYear: "2018",
      endYear: "2022",
      gpa: "",
      notes: "",
    },
  ],
  skills: [
    {
      id: createId(),
      group: "Languages",
      items: ["TypeScript", "JavaScript", "SQL"],
    },
    {
      id: createId(),
      group: "Frameworks",
      items: ["React", "Next.js", "Node.js"],
    },
  ],
  projects: [
    {
      id: createId(),
      name: "Project Name",
      url: "https://example.com",
      description: "A short project summary.",
      techStack: ["Next.js", "PostgreSQL", "Tailwind CSS"],
      bullets: ["Designed and implemented core user workflows."],
    },
  ],
  certifications: [
    {
      id: createId(),
      name: "Certification Name",
      issuer: "Issuer",
      date: "2024",
      credentialUrl: "https://credentials.example.com",
    },
  ],
  custom: [
    {
      id: createId(),
      title: "Highlights",
      body: "",
      bullets: ["Open-source contributor and mentor."],
    },
  ],
});

export const parseResumeContent = (value: unknown): ResumeContent =>
  resumeContentSchema.parse(value);
