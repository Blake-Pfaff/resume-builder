import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const user = await requireUser();

  const resumes = await db.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      template: true,
      updatedAt: true,
    },
  });

  return (
    <DashboardShell
      initialResumes={resumes.map((resume) => ({
        ...resume,
        updatedAt: resume.updatedAt.toISOString(),
      }))}
    />
  );
}
