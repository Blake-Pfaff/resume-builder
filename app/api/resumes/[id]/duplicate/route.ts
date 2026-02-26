import { NextResponse } from "next/server";

import { getRouteUser } from "@/lib/api-auth";
import { db } from "@/lib/db";

type Params = { params: { id: string } };

export async function POST(_: Request, { params }: Params) {
  const { user, unauthorized } = await getRouteUser();
  if (!user) return unauthorized!;

  const existing = await db.resume.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const duplicated = await db.resume.create({
    data: {
      userId: existing.userId,
      title: `${existing.title} (Copy)`,
      template: existing.template,
      content: existing.content,
    },
  });

  return NextResponse.json(duplicated, { status: 201 });
}
