import { NextResponse } from "next/server";
import { z } from "zod";

import { getRouteUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { parseResumeContent } from "@/lib/resume";

const updateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  template: z.enum(["classic", "modern"]).optional(),
  content: z.unknown().optional(),
});

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  const { user, unauthorized } = await getRouteUser();
  if (!user) return unauthorized!;

  const resume = await db.resume.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ...resume, content: parseResumeContent(resume.content) });
}

export async function PATCH(request: Request, { params }: Params) {
  const { user, unauthorized } = await getRouteUser();
  if (!user) return unauthorized!;

  const body = await request.json();
  const payload = updateSchema.parse(body);

  const existing = await db.resume.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.resume.update({
    where: { id: params.id },
    data: {
      title: payload.title ?? existing.title,
      template: payload.template ?? existing.template,
      content: payload.content ? parseResumeContent(payload.content) : parseResumeContent(existing.content),
    },
  });

  return NextResponse.json({ ...updated, content: parseResumeContent(updated.content) });
}

export async function DELETE(_: Request, { params }: Params) {
  const { user, unauthorized } = await getRouteUser();
  if (!user) return unauthorized!;

  const existing = await db.resume.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.resume.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
