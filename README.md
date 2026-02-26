# Resume Builder

Single-user resume generator built with Next.js App Router, TypeScript, Tailwind, Prisma, Supabase Auth, and `@react-pdf/renderer`.

## Setup

1. Copy env vars:

```bash
cp .env.example .env
```

2. Fill in Supabase/Postgres values in `.env`.

3. Generate Prisma client and run migration:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Start the app:

```bash
npm run dev
```

## Implemented Routes

- `/login`
- `/dashboard`
- `/editor/[id]`
- `/api/resumes`
- `/api/resumes/[id]`
- `/api/resumes/[id]/duplicate`
- `/api/export/[id]`

## Notes

- Autosave runs with a 1-second debounce in the editor.
- `Cmd/Ctrl + S` forces a manual save.
- PDF export is available from dashboard cards and the editor header.
- Full PRD is in `PRD.md`.
