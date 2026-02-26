import { ResumeContent, ResumeTemplate } from "@/lib/resume";

type Props = {
  content: ResumeContent;
  template: ResumeTemplate;
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h3 className="border-b border-zinc-300 pb-1 text-sm font-semibold uppercase tracking-wide text-zinc-700">{title}</h3>
    <div className="text-sm text-zinc-700">{children}</div>
  </section>
);

const ClassicTemplate = ({ content }: { content: ResumeContent }) => (
  <article className="mx-auto w-[8.5in] min-h-[11in] bg-white p-10 text-zinc-900 shadow">
    <header className="mb-6">
      <h1 className="text-3xl font-bold">{content.header.fullName}</h1>
      <p className="text-base text-zinc-700">{content.header.jobTitle}</p>
      <p className="mt-2 text-xs text-zinc-600">
        {[
          content.header.email,
          content.header.phone,
          content.header.location,
          content.header.linkedin,
          content.header.github,
          content.header.portfolio,
        ]
          .filter(Boolean)
          .join(" | ")}
      </p>
    </header>
    <main className="space-y-5">
      {content.sections.summary ? <Section title="Summary">{content.summary}</Section> : null}
      {content.sections.experience ? (
        <Section title="Experience">
          <div className="space-y-3">
            {content.experience.map((role) => (
              <div key={role.id}>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <p>
                    {role.role} - {role.company}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {role.startDate} - {role.endDate}
                  </p>
                </div>
                <p className="text-xs text-zinc-500">{role.location}</p>
                <ul className="ml-5 list-disc text-sm">
                  {role.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
      {content.sections.education ? (
        <Section title="Education">
          {content.education.map((item) => (
            <p key={item.id}>
              <span className="font-semibold">
                {item.degree} {item.fieldOfStudy && `in ${item.fieldOfStudy}`}
              </span>{" "}
              - {item.institution} ({item.startYear} - {item.endYear})
            </p>
          ))}
        </Section>
      ) : null}
      {content.sections.skills ? (
        <Section title="Skills">
          <div className="space-y-1">
            {content.skills.map((group) => (
              <p key={group.id}>
                <span className="font-semibold">{group.group}: </span>
                {group.items.join(", ")}
              </p>
            ))}
          </div>
        </Section>
      ) : null}
      {content.sections.projects ? (
        <Section title="Projects">
          <div className="space-y-2">
            {content.projects.map((project) => (
              <div key={project.id}>
                <p className="font-semibold">
                  {project.name} {project.url ? `- ${project.url}` : ""}
                </p>
                <p>{project.description}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
      {content.sections.certifications ? (
        <Section title="Certifications">
          {content.certifications.map((cert) => (
            <p key={cert.id}>
              {cert.name} - {cert.issuer} ({cert.date})
            </p>
          ))}
        </Section>
      ) : null}
      {content.sections.custom
        ? content.custom.map((section) => (
            <Section key={section.id} title={section.title || "Custom"}>
              {section.body ? <p>{section.body}</p> : null}
              {section.bullets.length ? (
                <ul className="ml-5 list-disc">
                  {section.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </Section>
          ))
        : null}
    </main>
  </article>
);

const ModernTemplate = ({ content }: { content: ResumeContent }) => (
  <article className="mx-auto grid w-[8.5in] min-h-[11in] grid-cols-[2.2fr_1fr] bg-white text-zinc-900 shadow">
    <main className="p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{content.header.fullName}</h1>
        <p className="text-base text-sky-700">{content.header.jobTitle}</p>
      </header>
      {content.sections.summary ? <Section title="Summary">{content.summary}</Section> : null}
      {content.sections.experience ? (
        <div className="mt-6">
          <Section title="Experience">
            <div className="space-y-3">
              {content.experience.map((role) => (
                <div key={role.id}>
                  <p className="font-semibold">
                    {role.role} - {role.company}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {role.startDate} - {role.endDate}
                  </p>
                  <ul className="ml-5 list-disc">
                    {role.bullets.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        </div>
      ) : null}
    </main>
    <aside className="bg-sky-50 p-6">
      <div className="text-xs text-zinc-700">
        {[content.header.email, content.header.phone, content.header.location].filter(Boolean).map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <div className="mt-4 text-xs text-zinc-700">
        {[content.header.linkedin, content.header.github, content.header.portfolio].filter(Boolean).map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      {content.sections.skills ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide">Skills</h3>
          {content.skills.map((group) => (
            <p key={group.id} className="mt-1 text-xs">
              <span className="font-semibold">{group.group}:</span> {group.items.join(", ")}
            </p>
          ))}
        </div>
      ) : null}
      {content.sections.education ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide">Education</h3>
          {content.education.map((item) => (
            <p key={item.id} className="mt-1 text-xs">
              {item.degree} - {item.institution}
            </p>
          ))}
        </div>
      ) : null}
    </aside>
  </article>
);

export const ResumePreview = ({ content, template }: Props) => {
  if (template === "modern") {
    return <ModernTemplate content={content} />;
  }

  return <ClassicTemplate content={content} />;
};
