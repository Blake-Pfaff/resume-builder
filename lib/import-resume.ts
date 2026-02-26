import { createDefaultResumeContent, type ResumeContent } from "@/lib/resume";

const SECTION_ALIASES: Array<{ key: keyof Pick<ResumeContent, "summary" | "experience" | "education" | "skills" | "projects" | "certifications">; patterns: RegExp[] }> =
  [
    { key: "summary", patterns: [/^summary$/i, /^professional summary$/i, /^profile$/i] },
    {
      key: "experience",
      patterns: [/^experience$/i, /^work experience$/i, /^work history$/i, /^employment$/i, /^employment history$/i],
    },
    { key: "education", patterns: [/^education$/i, /^academic background$/i] },
    { key: "skills", patterns: [/^skills$/i, /^technical skills$/i, /^core competencies$/i] },
    { key: "projects", patterns: [/^projects$/i, /^project experience$/i] },
    { key: "certifications", patterns: [/^certifications?$/i, /^licenses?$/i] },
  ];

const cleanLine = (line: string) => line.replace(/\s+/g, " ").trim();
const stripBulletPrefix = (line: string) => line.replace(/^[-*•\u2022]\s*/, "").trim();
const takeNonEmpty = (lines: string[]) => lines.map(cleanLine).filter(Boolean);
const isStandaloneBullet = (line: string) => /^[-*•\u2022]\s*$/.test(line.trim());
const hasText = (value: string) => cleanLine(value).length > 0;
const normalizeSectionHeader = (line: string) =>
  line
    .toLowerCase()
    .replace(/^[+•\-\s:]+/, "")
    .replace(/[:\s]+$/, "")
    .trim();

const dateSplitRegex = /\s*[-–—]\s*/;

const parseHeader = (topLines: string[]) => {
  const emailMatch = topLines.join(" ").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)?.[0] ?? "";
  const phoneMatch =
    topLines
      .join(" ")
      .match(/(\+?\d[\d()\-\s]{7,}\d)/g)
      ?.map((value) => value.trim())[0] ?? "";

  const urls = topLines
    .join(" ")
    .match(/https?:\/\/[^\s)]+|[a-z0-9-]+\.(?:com|io|dev|net|org)\/[^\s)]+/gi) ?? [];

  const linkedin = urls.find((value) => /linkedin\.com/i.test(value)) ?? "";
  const github = urls.find((value) => /github\.com/i.test(value)) ?? "";
  const portfolio = urls.find((value) => value !== linkedin && value !== github) ?? "";

  return {
    fullName: topLines[0] ?? "Imported Candidate",
    jobTitle: topLines[1] ?? "",
    email: emailMatch,
    phone: phoneMatch,
    location: "",
    linkedin,
    github,
    portfolio,
  };
};

const bucketSections = (lines: string[]) => {
  const buckets: Record<string, string[]> = {
    preamble: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  };

  let current: keyof typeof buckets = "preamble";
  for (const line of lines) {
    const normalized = normalizeSectionHeader(line);
    const alias = SECTION_ALIASES.find(({ patterns }) => patterns.some((pattern) => pattern.test(normalized)));
    if (alias) {
      current = alias.key;
      continue;
    }
    buckets[current].push(line);
  }

  return buckets;
};

const MONTH_PATTERN = "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)";
const DATE_RANGE_PATTERN = `${MONTH_PATTERN}\\s+\\d{4}\\s*[-–—]\\s*(?:${MONTH_PATTERN}\\s+\\d{4}|Present|Current)`;
const DATE_RANGE_RE = new RegExp(DATE_RANGE_PATTERN, "i");
const EXPERIENCE_PIPE_RE = new RegExp(
  `^(?<company>[^|]+?)\\s*\\|\\s*(?<roleText>.+?)\\s+(?<dateRange>${DATE_RANGE_PATTERN})$`,
  "i",
);
const EXPERIENCE_PARENS_RE = new RegExp(
  `^(?<company>.+?)\\s*\\((?<dateRange>${DATE_RANGE_PATTERN})\\)\\s*(?:[-–—|]\\s*(?<roleText>.+))?$`,
  "i",
);
const EXPERIENCE_SIMPLE_RE = new RegExp(`^(?<company>.+?)\\s+(?<dateRange>${DATE_RANGE_PATTERN})$`, "i");
const EXPERIENCE_COMPACT_RE = new RegExp(`^(?<company>.+?)(?<dateRange>${DATE_RANGE_PATTERN})$`, "i");

const parseExperienceStart = (line: string) => {
  const pipeMatch = line.match(EXPERIENCE_PIPE_RE);
  if (pipeMatch?.groups?.company && pipeMatch.groups.dateRange) {
    return {
      company: pipeMatch.groups.company.trim(),
      role: (pipeMatch.groups.roleText ?? "").trim(),
      dateRange: pipeMatch.groups.dateRange.trim(),
    };
  }

  const parensMatch = line.match(EXPERIENCE_PARENS_RE);
  if (parensMatch?.groups?.company && parensMatch.groups.dateRange) {
    return {
      company: parensMatch.groups.company.trim(),
      role: (parensMatch.groups.roleText ?? "").trim(),
      dateRange: parensMatch.groups.dateRange.trim(),
    };
  }

  const simpleMatch = line.match(EXPERIENCE_SIMPLE_RE);
  if (simpleMatch?.groups?.company && simpleMatch.groups.dateRange) {
    return {
      company: simpleMatch.groups.company.trim(),
      role: "",
      dateRange: simpleMatch.groups.dateRange.trim(),
    };
  }

  const compactMatch = line.match(EXPERIENCE_COMPACT_RE);
  if (compactMatch?.groups?.company && compactMatch.groups.dateRange) {
    return {
      company: compactMatch.groups.company.trim(),
      role: "",
      dateRange: compactMatch.groups.dateRange.trim(),
    };
  }

  return null;
};

const appendBullet = (entry: ResumeContent["experience"][number], line: string) => {
  const text = cleanLine(line);
  if (!text) return;
  const last = entry.bullets.at(-1);
  const isLikelyContinuation = !!last && /^[a-z0-9(]/.test(text);
  if (isLikelyContinuation) {
    entry.bullets[entry.bullets.length - 1] = `${last} ${text}`;
    return;
  }
  entry.bullets.push(text);
};

const parseExperienceLines = (lines: string[]) => {
  const parsed: ResumeContent["experience"] = [];
  let current: ResumeContent["experience"][number] | null = null;

  const pushCurrent = () => {
    if (!current) return;
    if (!current.company && !current.role && current.bullets.length === 0) return;
    parsed.push(current);
    current = null;
  };

  for (const line of lines) {
    const startMatch = parseExperienceStart(line);
    if (startMatch) {
      pushCurrent();
      const [startDateRaw, endDateRaw] = startMatch.dateRange.split(dateSplitRegex).map((part) => part.trim());

      current = {
        id: crypto.randomUUID(),
        company: startMatch.company,
        role: startMatch.role,
        startDate: startDateRaw ?? "",
        endDate: endDateRaw ?? "",
        location: "",
        bullets: [],
      };
      continue;
    }

    if (!current) {
      current = {
        id: crypto.randomUUID(),
        company: "Imported Experience",
        role: "",
        startDate: "",
        endDate: "",
        location: "",
        bullets: [],
      };
    }

    if (DATE_RANGE_RE.test(line) && !current.startDate && !current.endDate) {
      const extractedDateRange = line.match(DATE_RANGE_RE)?.[0];
      const [startDateRaw, endDateRaw] = (extractedDateRange ?? line)
        .split(dateSplitRegex)
        .map((part) => part.trim());
      current.startDate = startDateRaw ?? "";
      current.endDate = endDateRaw ?? "";
      continue;
    }

    if (/^[-*•\u2022]\s*/.test(line)) {
      const bullet = stripBulletPrefix(line);
      if (bullet) appendBullet(current, bullet);
      continue;
    }

    if (!current.role) {
      current.role = line;
    } else {
      appendBullet(current, line);
    }
  }

  pushCurrent();
  return parsed;
};

export const extractTextFromPdf = async (buffer: Buffer) => {
  // Use the library file directly to avoid the package debug wrapper in index.js.
  const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
  const pdfParse = (pdfParseModule.default ?? pdfParseModule) as (dataBuffer: Buffer) => Promise<{ text: string }>;
  const parsed = await pdfParse(buffer);
  return parsed.text;
};

export const buildResumeFromImportedText = (rawText: string): { title: string; content: ResumeContent; warnings: string[] } => {
  const warnings: string[] = [];
  const content = createDefaultResumeContent();

  const normalizedLines = rawText
    .replace(/\r/g, "\n")
    .split("\n")
    .map(cleanLine)
    .filter((line) => line && !/^page \d+/i.test(line) && !isStandaloneBullet(line));

  if (normalizedLines.length === 0) {
    warnings.push("No readable text found in this PDF.");
    return { title: "Imported Resume", content, warnings };
  }

  const buckets = bucketSections(normalizedLines);
  const headerLines = takeNonEmpty(normalizedLines.slice(0, 8));
  content.header = parseHeader(headerLines);

  const preamble = takeNonEmpty(buckets.preamble);
  const summaryLines = takeNonEmpty(buckets.summary);
  content.summary = summaryLines.join(" ") || preamble.slice(0, 3).join(" ");

  const experienceLines = takeNonEmpty(buckets.experience);
  const parsedExperience = parseExperienceLines(experienceLines);
  content.experience =
    parsedExperience.length > 0
      ? parsedExperience
      : [
          {
            id: crypto.randomUUID(),
            company: "Imported Experience",
            role: "",
            startDate: "",
            endDate: "",
            location: "",
            bullets: experienceLines.slice(0, 8),
          },
        ];
  content.experience = content.experience.map((item) => ({
    ...item,
    bullets: item.bullets.map(cleanLine).filter((line) => line && !isStandaloneBullet(line)),
  }));
  content.experience = content.experience.filter(
    (item) =>
      hasText(item.company) ||
      hasText(item.role) ||
      hasText(item.startDate) ||
      hasText(item.endDate) ||
      item.bullets.length > 0,
  );

  const educationLines = takeNonEmpty(buckets.education);
  content.education = educationLines.length
    ? [
        {
          id: crypto.randomUUID(),
          institution: educationLines[0] ?? "",
          degree: educationLines[1] ?? "",
          fieldOfStudy: "",
          startYear: "",
          endYear: "",
          gpa: "",
          notes: educationLines.slice(2).join(" "),
        },
      ]
    : [];
  content.education = content.education.filter(
    (item) => hasText(item.institution) || hasText(item.degree) || hasText(item.notes ?? ""),
  );

  const skillsLines = takeNonEmpty(buckets.skills);
  const skillItems = skillsLines
    .join(", ")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  content.skills = skillItems.length
    ? [
        {
          id: crypto.randomUUID(),
          group: "Imported Skills",
          items: skillItems,
        },
      ]
    : [];

  const projectLines = takeNonEmpty(buckets.projects);
  content.projects = projectLines.length
    ? [
        {
          id: crypto.randomUUID(),
          name: projectLines[0] ?? "",
          url: "",
          description: projectLines.slice(1, 4).join(" "),
          techStack: [],
          bullets: projectLines.slice(4, 10),
        },
      ]
    : [];
  content.projects = content.projects.filter(
    (item) => hasText(item.name) || hasText(item.description) || item.bullets.length > 0,
  );

  const certLines = takeNonEmpty(buckets.certifications);
  content.certifications = certLines.length
    ? [
        {
          id: crypto.randomUUID(),
          name: certLines[0] ?? "",
          issuer: certLines[1] ?? "",
          date: "",
          credentialUrl: "",
        },
      ]
    : [];
  content.certifications = content.certifications.filter((item) => hasText(item.name) || hasText(item.issuer));

  const hasRecognizedSections =
    experienceLines.length > 0 ||
    educationLines.length > 0 ||
    skillsLines.length > 0 ||
    projectLines.length > 0 ||
    certLines.length > 0 ||
    summaryLines.length > 0;

  if (!hasRecognizedSections) {
    warnings.push("Section headers were not clearly detected. Review imported content carefully.");
  }

  const uncategorizedLines = preamble.slice(3);
  if (uncategorizedLines.length > 0) {
    content.custom = [
      {
        id: crypto.randomUUID(),
        title: "Imported Notes",
        body: "",
        bullets: uncategorizedLines.slice(0, 12),
      },
    ];
  } else {
    content.custom = [];
  }

  content.sections = {
    ...content.sections,
    summary: hasText(content.summary),
    experience: content.experience.length > 0,
    education: content.education.length > 0,
    skills: content.skills.length > 0,
    projects: content.projects.length > 0,
    certifications: content.certifications.length > 0,
    custom: content.custom.length > 0,
  };

  const title = content.header.fullName ? `${content.header.fullName} - Imported Resume` : "Imported Resume";
  return { title, content, warnings };
};
