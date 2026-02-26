# Product Requirements Document

## Feature: Import and Read Resume (PDF)

- **Version:** 1.0
- **Status:** Draft
- **Owner:** Blake Pfaff
- **Target App:** Resume Generator App

## 1) Overview

Add a feature that allows the user to upload an existing PDF resume, extract readable content from it, and generate a structured resume draft inside the app editor. The imported draft should be editable and saved as a standard resume record.

## 2) Goals

- Allow the user to upload a resume PDF from local disk.
- Parse text content from the uploaded file.
- Map extracted content into the app's structured resume format (header, summary, experience, education, skills, projects, certifications).
- Create a new editable resume in the database from imported content.
- Provide clear feedback when extraction confidence is low or data is incomplete.

## 3) Non-Goals (V1)

- OCR for image-only or scanned PDFs.
- Guaranteed perfect parsing for all resume designs.
- Import from DOC/DOCX, Google Docs, or LinkedIn.
- AI rewriting, optimization, or ATS scoring.
- Bulk import of multiple files.

## 4) User Stories

- As a user, I can upload a PDF resume from the dashboard.
- As a user, I can preview extracted sections before finalizing import.
- As a user, I can create a new resume draft from extracted content in one click.
- As a user, I can manually fix fields that were not parsed correctly.
- As a user, I can cancel import and keep my existing resumes unchanged.

## 5) Functional Scope

- Add an "Import Resume" action on dashboard.
- Accept file type `.pdf` only in V1.
- Enforce upload size limit (recommended: 5 MB).
- Extract text content from PDF on server side.
- Parse extracted text into structured resume schema.
- Show "import review" UI with editable fields before saving.
- Save imported content as a new resume record with default template.
- Route user to editor after import save.

## 6) UX Flow

1. User clicks "Import Resume" from dashboard.
2. User selects a PDF file and uploads.
3. App processes file and extracts text.
4. App displays parsed sections in review screen.
5. User edits fields as needed.
6. User clicks "Create Resume".
7. App stores new resume and navigates to `/editor/[id]`.

## 7) Parsing and Mapping Rules (V1)

- Detect section headers with common labels (`Experience`, `Work History`, `Education`, `Skills`, `Projects`, `Certifications`, `Summary`).
- Split section blocks into structured arrays where possible.
- Use conservative parsing: if confidence is low, store text in a fallback "raw notes" block for manual correction.
- Preserve original ordering of detected sections when possible.
- Never discard extracted text silently.

## 8) Data Model Impact

No required schema changes for V1 if parsed output is stored in existing `Resume.content` JSON structure.

Optional metadata extension (future):

```ts
{
  importMeta?: {
    source: "pdf"
    importedAt: string
    parseWarnings: string[]
  }
}
```

## 9) API / Backend Scope

- New endpoint: `POST /api/resumes/import`
  - Validates auth.
  - Accepts multipart PDF upload.
  - Extracts text from PDF.
  - Parses and returns structured draft + warnings.

- New endpoint: `POST /api/resumes/import/commit` (optional split)
  - Accepts reviewed structured content.
  - Creates resume row in DB.
  - Returns new resume id.

Alternative: one endpoint for parse + create when no review step is needed.

## 10) Frontend Scope

- Dashboard: add "Import Resume" button and upload dialog.
- New import review screen/modal with editable mapped fields.
- Error and warning states:
  - unsupported file type
  - file too large
  - parse failed
  - partial extraction

## 11) Validation and Security

- Auth required for import endpoints.
- Validate MIME type and extension.
- Enforce upload size limit.
- Reject encrypted/password-protected PDFs in V1 with clear message.
- Avoid logging full resume content in server logs.

## 12) Acceptance Criteria

- User can upload a valid PDF and receive parsed structured data.
- User can edit parsed data before saving.
- Saved imported resume appears in dashboard and opens in editor.
- App gracefully handles parse failures with actionable error message.
- Existing resume create/edit/export flows remain unaffected.

## 13) Metrics

- Import success rate (% uploads that produce savable draft).
- Average time from upload to editable draft.
- % imports requiring manual correction.
- Parse failure rate by error type.

## 14) Risks and Mitigations

- **Risk:** Resume formats vary heavily.
  - **Mitigation:** Conservative parsing + editable review step.
- **Risk:** Scanned PDFs contain no extractable text.
  - **Mitigation:** Explicit unsupported message in V1.
- **Risk:** Large files increase latency.
  - **Mitigation:** File-size limits and async processing guardrails.

## 15) Open Questions

- Should review happen in a modal or dedicated route?
- Do we persist original extracted raw text for debugging/user reference?
- Is OCR needed in V1.1 or later?
- Should import auto-select a template based on detected formatting?
