# Product Requirements Document

## Resume Generator App

- **Version:** 1.0
- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui-style components, Prisma, PostgreSQL (Supabase), react-pdf, Vercel

## 1) Overview

A personal web application that allows a single owner to create, edit, and manage multiple resumes with a live preview editor and one-click PDF export. Resumes are stored in a database and can be tailored to specific job applications.

## 2) Goals

- Maintain multiple resume versions.
- Edit resume content through structured forms with live preview.
- Export any resume as a pixel-perfect PDF.
- Keep the app simple and single-user.

## 3) Non-Goals (V1)

- Multi-user support or public sharing.
- AI-assisted writing.
- Cover letter builder.
- ATS scoring or job matching.
- Mobile-first editor UX.

## 4) User Stories

- Create, edit, duplicate, delete, and export resumes.
- Reorder sections and bullets with drag-and-drop.
- Choose from multiple templates.
- Log in via password or magic link.
- Manage all resume versions in a dashboard.

## 5) Functional Scope

- Supabase authentication.
- Protected dashboard and editor.
- Two-panel editor with autosave and unsaved indicator.
- Drag-and-drop section and bullet ordering.
- PDF export via `@react-pdf/renderer`.
- Template selection: `classic` and `modern`.
- Resume data persisted in Prisma model using `content: Json`.

## 6) Data Model

```ts
// Resume
{
  id: string
  userId: string
  title: string
  template: string // "classic" | "modern"
  content: Json
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 7) API Routes

- `GET /api/resumes`
- `POST /api/resumes`
- `GET /api/resumes/[id]`
- `PATCH /api/resumes/[id]`
- `DELETE /api/resumes/[id]`
- `POST /api/resumes/[id]/duplicate`
- `GET /api/export/[id]`

## 8) Pages & Routes

- `/login`
- `/dashboard`
- `/editor/[id]`

## 9) Environment Variables

```env
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
