"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";
import { GripVertical } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ResumePreview } from "@/components/preview/resume-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn, StaggerList } from "@/components/ui/motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ResumeDocument } from "@/lib/pdf";
import {
  SECTION_KEYS,
  type ResumeContent,
  type ResumeTemplate,
  type SectionKey,
} from "@/lib/resume";
import { fadeInUp } from "@/lib/motion";

type ResumeApiShape = {
  id: string;
  title: string;
  template: ResumeTemplate;
  content: ResumeContent;
};

const SortableRow = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
        <button className="cursor-grab" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <span>Drag to reorder</span>
      </div>
      {children}
    </div>
  );
};

export const EditorShell = ({ resume }: { resume: ResumeApiShape }) => {
  const [title, setTitle] = useState(resume.title);
  const [template, setTemplate] = useState<ResumeTemplate>(resume.template);
  const [content, setContent] = useState<ResumeContent>(resume.content);
  const [pendingSave, setPendingSave] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  const saveChanges = useCallback(
    async (next: Partial<Pick<ResumeApiShape, "title" | "template" | "content">>) => {
      setPendingSave(true);
      const response = await fetch(`/api/resumes/${resume.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!response.ok) {
        toast.error("Save failed.");
        setPendingSave(false);
        return;
      }
      setPendingSave(false);
    },
    [resume.id],
  );

  const debouncedSave = useMemo(() => debounce(saveChanges, 1000), [saveChanges]);

  useEffect(() => () => debouncedSave.cancel(), [debouncedSave]);

  useEffect(() => {
    debouncedSave({ title, template, content });
  }, [title, template, content, debouncedSave]);

  useEffect(() => {
    const onSave = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        debouncedSave.flush();
        toast.success("Saved.");
      }
    };
    window.addEventListener("keydown", onSave);
    return () => window.removeEventListener("keydown", onSave);
  }, [debouncedSave]);

  const onSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = content.sectionOrder.indexOf(active.id as SectionKey);
    const newIndex = content.sectionOrder.indexOf(over.id as SectionKey);
    setContent((prev) => ({
      ...prev,
      sectionOrder: arrayMove(prev.sectionOrder, oldIndex, newIndex),
    }));
  };

  const onExperienceBulletDragEnd = (
    experienceId: string,
    event: DragEndEvent,
  ) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setContent((prev) => {
      const experience = prev.experience.find((item) => item.id === experienceId);
      if (!experience) return prev;
      const oldIndex = Number(String(active.id).split("::").at(-1) ?? -1);
      const newIndex = Number(String(over.id).split("::").at(-1) ?? -1);
      if (oldIndex < 0 || newIndex < 0) return prev;
      const nextBullets = arrayMove(experience.bullets, oldIndex, newIndex);
      return {
        ...prev,
        experience: prev.experience.map((item) =>
          item.id === experienceId ? { ...item, bullets: nextBullets } : item,
        ),
      };
    });
  };

  const exportPdf = async () => {
    toast.message("Export started.");
    const blob = await pdf(<ResumeDocument content={content} template={template} />).toBlob();
    const anchor = document.createElement("a");
    const fileName = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;
    anchor.href = URL.createObjectURL(blob);
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  return (
    <FadeIn>
      <main className="flex min-h-screen min-w-[1100px] flex-col bg-zinc-50">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200/80 bg-white/90 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="w-[340px]" />
          <Select value={template} onValueChange={(value) => setTemplate(value as ResumeTemplate)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classic">Classic</SelectItem>
              <SelectItem value="modern">Modern</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <motion.span
            key={pendingSave ? "saving" : "saved"}
            initial={{ opacity: 0.5, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
            className="text-sm text-zinc-500"
          >
            {pendingSave ? "Saving..." : "All changes saved"}
          </motion.span>
          <Button variant="outline" onClick={exportPdf}>
            Export PDF
          </Button>
        </div>
      </header>

      <section className="grid flex-1 grid-cols-[1fr_1.1fr] bg-zinc-100/70">
        <div className="overflow-y-auto border-r border-zinc-200 bg-zinc-50 p-6">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onSectionDragEnd}>
            <SortableContext items={content.sectionOrder} strategy={verticalListSortingStrategy}>
              <StaggerList className="space-y-4">
                {content.sectionOrder.map((sectionKey) => (
                  <motion.div key={sectionKey} variants={fadeInUp}>
                    <SortableRow id={sectionKey}>
                      <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold capitalize">{sectionKey}</h2>
                        <Switch
                          checked={content.sections[sectionKey]}
                          onCheckedChange={(checked) =>
                            setContent((prev) => ({
                              ...prev,
                              sections: { ...prev.sections, [sectionKey]: checked },
                            }))
                          }
                        />
                      </div>
                      {sectionKey === "header" ? (
                        <div className="grid gap-2">
                          <Input
                            value={content.header.fullName}
                            onChange={(e) =>
                              setContent((prev) => ({
                                ...prev,
                                header: { ...prev.header, fullName: e.target.value },
                              }))
                            }
                            placeholder="Full name"
                          />
                          <Input
                            value={content.header.jobTitle}
                            onChange={(e) =>
                              setContent((prev) => ({
                                ...prev,
                                header: { ...prev.header, jobTitle: e.target.value },
                              }))
                            }
                            placeholder="Job title"
                          />
                          <Input
                            value={content.header.email}
                            onChange={(e) =>
                              setContent((prev) => ({
                                ...prev,
                                header: { ...prev.header, email: e.target.value },
                              }))
                            }
                            placeholder="Email"
                          />
                        </div>
                      ) : null}
                    {sectionKey === "summary" ? (
                      <Textarea
                        value={content.summary}
                        onChange={(e) => setContent((prev) => ({ ...prev, summary: e.target.value }))}
                      />
                    ) : null}
                    {sectionKey === "experience" ? (
                      <div className="space-y-4">
                        {content.experience.map((item, idx) => (
                          <div key={item.id} className="space-y-2 rounded border border-zinc-200 p-3">
                            <Input
                              value={item.company}
                              onChange={(e) =>
                                setContent((prev) => ({
                                  ...prev,
                                  experience: prev.experience.map((role, roleIdx) =>
                                    roleIdx === idx ? { ...role, company: e.target.value } : role,
                                  ),
                                }))
                              }
                              placeholder="Company"
                            />
                            <Input
                              value={item.role}
                              onChange={(e) =>
                                setContent((prev) => ({
                                  ...prev,
                                  experience: prev.experience.map((role, roleIdx) =>
                                    roleIdx === idx ? { ...role, role: e.target.value } : role,
                                  ),
                                }))
                              }
                              placeholder="Role"
                            />

                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(event) => onExperienceBulletDragEnd(item.id, event)}
                            >
                              <SortableContext
                                items={item.bullets.map((_, bulletIdx) => `${item.id}::${bulletIdx}`)}
                                strategy={verticalListSortingStrategy}
                              >
                                <div className="space-y-2">
                                  {item.bullets.map((bullet, bulletIdx) => (
                                    <SortableRow key={`${item.id}-${bulletIdx}`} id={`${item.id}::${bulletIdx}`}>
                                      <Textarea
                                        value={bullet}
                                        className="min-h-[56px]"
                                        onChange={(e) =>
                                          setContent((prev) => ({
                                            ...prev,
                                            experience: prev.experience.map((role, roleIdx) =>
                                              roleIdx === idx
                                                ? {
                                                    ...role,
                                                    bullets: role.bullets.map((line, lineIdx) =>
                                                      lineIdx === bulletIdx ? e.target.value : line,
                                                    ),
                                                  }
                                                : role,
                                            ),
                                          }))
                                        }
                                      />
                                    </SortableRow>
                                  ))}
                                </div>
                              </SortableContext>
                            </DndContext>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setContent((prev) => ({
                                  ...prev,
                                  experience: prev.experience.map((role, roleIdx) =>
                                    roleIdx === idx
                                      ? { ...role, bullets: [...role.bullets, "New bullet"] }
                                      : role,
                                  ),
                                }))
                              }
                            >
                              Add Bullet
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {sectionKey === "education" ? (
                      <div className="space-y-2">
                        {content.education.map((item, idx) => (
                          <Input
                            key={item.id}
                            value={item.institution}
                            onChange={(e) =>
                              setContent((prev) => ({
                                ...prev,
                                education: prev.education.map((edu, eduIdx) =>
                                  eduIdx === idx ? { ...edu, institution: e.target.value } : edu,
                                ),
                              }))
                            }
                          />
                        ))}
                      </div>
                    ) : null}
                    {sectionKey === "skills" ? (
                      <div className="space-y-2">
                        {content.skills.map((item, idx) => (
                          <Textarea
                            key={item.id}
                            value={`${item.group}: ${item.items.join(", ")}`}
                            onChange={(e) =>
                              setContent((prev) => ({
                                ...prev,
                                skills: prev.skills.map((skill, skillIdx) =>
                                  skillIdx === idx
                                    ? {
                                        ...skill,
                                        group: e.target.value.split(":")[0] || skill.group,
                                        items: (e.target.value.split(":")[1] || "")
                                          .split(",")
                                          .map((part) => part.trim())
                                          .filter(Boolean),
                                      }
                                    : skill,
                                ),
                              }))
                            }
                          />
                        ))}
                      </div>
                    ) : null}
                    {sectionKey === "projects" ? (
                      <div className="space-y-2">
                        {content.projects.map((item, idx) => (
                          <div key={item.id} className="space-y-2">
                            <Input
                              value={item.name}
                              onChange={(e) =>
                                setContent((prev) => ({
                                  ...prev,
                                  projects: prev.projects.map((project, projectIdx) =>
                                    projectIdx === idx ? { ...project, name: e.target.value } : project,
                                  ),
                                }))
                              }
                            />
                            <Textarea
                              value={item.description}
                              onChange={(e) =>
                                setContent((prev) => ({
                                  ...prev,
                                  projects: prev.projects.map((project, projectIdx) =>
                                    projectIdx === idx
                                      ? { ...project, description: e.target.value }
                                      : project,
                                  ),
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {sectionKey === "certifications" ? (
                      <div className="space-y-2">
                        {content.certifications.map((item, idx) => (
                          <Input
                            key={item.id}
                            value={item.name}
                            onChange={(e) =>
                              setContent((prev) => ({
                                ...prev,
                                certifications: prev.certifications.map((cert, certIdx) =>
                                  certIdx === idx ? { ...cert, name: e.target.value } : cert,
                                ),
                              }))
                            }
                          />
                        ))}
                      </div>
                    ) : null}
                    {sectionKey === "custom" ? (
                      <div className="space-y-2">
                        {content.custom.map((item, idx) => (
                          <div key={item.id} className="space-y-2">
                            <Input
                              value={item.title}
                              onChange={(e) =>
                                setContent((prev) => ({
                                  ...prev,
                                  custom: prev.custom.map((section, sectionIdx) =>
                                    sectionIdx === idx
                                      ? { ...section, title: e.target.value }
                                      : section,
                                  ),
                                }))
                              }
                            />
                            <Textarea
                              value={item.body}
                              onChange={(e) =>
                                setContent((prev) => ({
                                  ...prev,
                                  custom: prev.custom.map((section, sectionIdx) =>
                                    sectionIdx === idx
                                      ? { ...section, body: e.target.value }
                                      : section,
                                  ),
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                    </SortableRow>
                  </motion.div>
                ))}
              </StaggerList>
            </SortableContext>
          </DndContext>
        </div>
        <div className="overflow-auto p-6">
          <div className="mx-auto max-w-[860px] rounded-xl border border-zinc-200/70 bg-white p-3 shadow-sm">
            <ResumePreview content={content} template={template} />
          </div>
        </div>
      </section>
      </main>
    </FadeIn>
  );
};

export const ensureSectionOrder = (input: SectionKey[]) => {
  const next = [...input];
  SECTION_KEYS.forEach((key) => {
    if (!next.includes(key)) next.push(key);
  });
  return next;
};
