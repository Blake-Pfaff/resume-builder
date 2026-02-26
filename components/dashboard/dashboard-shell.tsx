"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

type ResumeRow = {
  id: string;
  title: string;
  template: string;
  updatedAt: string;
};

export const DashboardShell = ({ initialResumes }: { initialResumes: ResumeRow[] }) => {
  const [resumes, setResumes] = useState(initialResumes);
  const [title, setTitle] = useState("Software Engineer");
  const [template, setTemplate] = useState("classic");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const refreshResumes = async () => {
    const response = await fetch("/api/resumes");
    if (!response.ok) return;
    const data: ResumeRow[] = await response.json();
    setResumes(
      data.map((item) => ({
        ...item,
        updatedAt: new Date(item.updatedAt).toISOString(),
      })),
    );
  };

  const onCreate = async () => {
    const response = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, template }),
    });
    if (!response.ok) {
      toast.error("Unable to create resume.");
      return;
    }
    const created = await response.json();
    setOpen(false);
    router.push(`/editor/${created.id}`);
  };

  const onDuplicate = async (id: string) => {
    const response = await fetch(`/api/resumes/${id}/duplicate`, { method: "POST" });
    if (!response.ok) {
      toast.error("Unable to duplicate resume.");
      return;
    }
    await refreshResumes();
    toast.success("Resume duplicated.");
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Delete this resume?")) return;
    const response = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Unable to delete resume.");
      return;
    }
    await refreshResumes();
    toast.success("Resume deleted.");
  };

  const onExport = async (id: string) => {
    toast.message("Export started.");
    window.location.href = `/api/export/${id}`;
  };

  const onSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-zinc-600">Manage all resume variants in one place.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>New Resume</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create new resume</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resume title" />
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={onCreate}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={onSignOut}>
            Sign out
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resumes.map((resume) => (
          <Card key={resume.id}>
            <CardHeader className="space-y-2">
              <CardTitle className="line-clamp-1">{resume.title}</CardTitle>
              <CardDescription>
                Updated {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}
              </CardDescription>
              <Badge variant="secondary">{resume.template}</Badge>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <Link href={`/editor/${resume.id}`}>Edit</Link>
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDuplicate(resume.id)}>
                Duplicate
              </Button>
              <Button size="sm" variant="outline" onClick={() => onExport(resume.id)}>
                Export PDF
              </Button>
              <Button size="sm" variant="danger" onClick={() => onDelete(resume.id)}>
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
};
