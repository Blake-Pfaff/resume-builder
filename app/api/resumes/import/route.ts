import { NextResponse } from "next/server";

import { getRouteUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { buildResumeFromImportedText, extractTextFromPdf } from "@/lib/import-resume";
import { parseResumeContent } from "@/lib/resume";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const runtime = "nodejs";

export async function POST(request: Request) {
  const { user, unauthorized } = await getRouteUser();
  if (!user) return unauthorized!;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing PDF file upload." }, { status: 400 });
  }

  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "File is too large. Max size is 5MB." }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const text = await extractTextFromPdf(Buffer.from(arrayBuffer));
    const imported = buildResumeFromImportedText(text);

    const resume = await db.resume.create({
      data: {
        userId: user.id,
        title: imported.title,
        template: "classic",
        content: parseResumeContent(imported.content),
      },
    });

    return NextResponse.json({
      id: resume.id,
      title: resume.title,
      warnings: imported.warnings,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to import resume PDF.",
      },
      { status: 500 },
    );
  }
}
