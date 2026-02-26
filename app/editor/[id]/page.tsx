import { notFound } from "next/navigation";

import { EditorShell } from "@/components/editor/editor-shell";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseResumeContent, SECTION_KEYS } from "@/lib/resume";

type Params = {
  params: {
    id: string;
  };
};

export default async function EditorPage({ params }: Params) {
  const user = await requireUser();

  const resume = await db.resume.findFirst({
    where: {
      id: params.id,
      userId: user.id,
    },
  });

  if (!resume) {
    notFound();
  }

  const content = parseResumeContent(resume.content);
  const sectionOrder = content.sectionOrder.filter((section) => SECTION_KEYS.includes(section));
  SECTION_KEYS.forEach((section) => {
    if (!sectionOrder.includes(section)) sectionOrder.push(section);
  });

  return (
    <EditorShell
      resume={{
        id: resume.id,
        title: resume.title,
        template: resume.template as "classic" | "modern",
        content: { ...content, sectionOrder },
      }}
    />
  );
}
