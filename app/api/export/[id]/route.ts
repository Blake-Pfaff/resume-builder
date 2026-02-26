import { renderToBuffer } from "@react-pdf/renderer";
import { format } from "date-fns";
import { NextResponse } from "next/server";

import { getRouteUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { ResumeDocument } from "@/lib/pdf";
import { parseResumeContent } from "@/lib/resume";

type Params = { params: { id: string } };

const toFileName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export async function GET(_: Request, { params }: Params) {
  const { user, unauthorized } = await getRouteUser();
  if (!user) return unauthorized!;

  const resume = await db.resume.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const content = parseResumeContent(resume.content);
  const pdfBuffer = await renderToBuffer(
    ResumeDocument({
      content,
      template: resume.template as "classic" | "modern",
    }),
  );
  const fileName = `${toFileName(resume.title)}-${format(new Date(), "yyyy-MM-dd")}.pdf`;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
