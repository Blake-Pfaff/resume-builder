"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
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
import { FadeIn, StaggerList } from "@/components/ui/motion";
import { createClient } from "@/lib/supabase/client";
import { fadeInUp } from "@/lib/motion";

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
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
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

  const onImportResume = async () => {
    if (!importFile) {
      toast.error("Choose a PDF file to import.");
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const response = await fetch("/api/resumes/import", {
        method: "POST",
        body: formData,
      });
      const raw = await response.text();
      const data = raw ? (JSON.parse(raw) as { id?: string; warnings?: string[]; error?: string }) : {};
      if (!response.ok || !data.id) {
        toast.error(data.error ?? "Unable to import resume.");
        return;
      }

      if (Array.isArray(data.warnings) && data.warnings.length > 0) {
        toast.warning(data.warnings.join(" "));
      } else {
        toast.success("Resume imported.");
      }

      setImportFile(null);
      setImportOpen(false);
      router.push(`/editor/${data.id}`);
    } catch {
      toast.error("Import failed due to an unexpected server response.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-8">
      <FadeIn>
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-600">Manage all resume variants in one place.</p>
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
            <Dialog
              open={importOpen}
              onOpenChange={(next) => {
                setImportOpen(next);
                if (!next) setImportFile(null);
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline">Import Resume</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import resume PDF</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(event) => setImportFile(event.target.files?.[0] ?? null)}
                  />
                  <p className="text-xs text-zinc-500">
                    Upload a PDF resume. We will extract the text and create an editable draft.
                  </p>
                </div>
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setImportOpen(false)} disabled={importing}>
                    Cancel
                  </Button>
                  <Button onClick={onImportResume} disabled={!importFile || importing}>
                    {importing ? "Importing..." : "Import"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={onSignOut}>
              Sign out
            </Button>
          </div>
        </header>
      </FadeIn>

      <StaggerList className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {resumes.map((resume) => (
          <motion.div key={resume.id} variants={fadeInUp} whileHover={{ y: -2 }} transition={{ duration: 0.16 }}>
            <Card className="border-zinc-200/90 shadow-sm transition-shadow duration-200 hover:shadow-lg">
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
          </motion.div>
        ))}
      </StaggerList>
    </div>
  );
};
