import { NextResponse } from "next/server";
import { z } from "zod";

import { getRouteUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { createDefaultResumeContent, parseResumeContent } from "@/lib/resume";

const createResumeSchema = z.object({
  title: z.string().min(1).max(120),
  template: z.enum(["classic", "modern"]).default("classic"),
});

export async function GET() {
  const { user, unauthorized } = await getRouteUser();
  if (!user) return unauthorized!;

  const resumes = await db.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(resumes);
}

export async function POST(request: Request) {
  const { user, unauthorized } = await getRouteUser();
  if (!user) return unauthorized!;

  const body = await request.json();
  const payload = createResumeSchema.parse(body);

  const resume = await db.resume.create({
    data: {
      userId: user.id,
      title: payload.title,
      template: payload.template,
      content: createDefaultResumeContent(),
    },
  });

  return NextResponse.json(
    {
      ...resume,
      content: parseResumeContent(resume.content),
    },
    { status: 201 },
  );
}
