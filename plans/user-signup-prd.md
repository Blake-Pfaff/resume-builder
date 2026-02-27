# Product Requirements Document

## Feature: User Signup and Account Onboarding

- **Version:** 1.0
- **Status:** Draft
- **Owner:** Blake Pfaff
- **Target App:** Resume Generator App

## 1) Overview

Add support for new users to create their own accounts directly in the app. Users should be able to sign up with email/password (and optionally magic link), verify account ownership, and land in an initialized dashboard experience.

## 2) Goals

- Allow users who do not already have an account to register from the UI.
- Support secure signup with Supabase Auth.
- Provide clear success/error states during registration.
- Ensure new users are routed into the existing dashboard/editor flow.
- Preserve current login behavior for existing users.

## 3) Non-Goals (V1)

- Social login providers (Google, GitHub, etc.).
- Team/org collaboration features.
- Account profile management UI.
- Password reset redesign (existing provider flow is acceptable).

## 4) User Stories

- As a new user, I can create an account with my email and password.
- As a new user, I can use magic link signup if enabled.
- As a new user, I get clear guidance if my email is already registered.
- As a verified user, I’m redirected to dashboard after signup/login.
- As an existing user, I can still sign in normally without flow regressions.

## 5) Functional Scope

- Add signup entry point on `/login` (toggle or dedicated `/signup` route).
- Add email + password signup form submission using Supabase auth API.
- If email confirmation is enabled, show confirmation instructions after signup.
- If email confirmation is disabled, sign user in immediately and redirect.
- Handle known auth errors with friendly messages.
- Keep middleware protection for dashboard/editor routes.

## 6) UX Flow

1. User opens `/login`.
2. User chooses **Sign up**.
3. User enters email/password and submits.
4. App calls signup endpoint/client auth method.
5. On success:
   - if confirmation required: show “check your email” message
   - if not required: route to `/dashboard`
6. User proceeds to create/import resumes.

## 7) API / Auth Scope

- Use Supabase `signUp` in client auth flow (or API route wrapper if preferred).
- Preserve current `signInWithPassword` and `signInWithOtp`.
- Ensure app handles Supabase response cases:
  - user created + session present
  - user created + no session (confirmation required)
  - duplicate/invalid credential errors

## 8) Data Model Impact

No Prisma schema changes required for signup itself.

The existing resume model remains user-scoped via `userId`.

## 9) Frontend Scope

- Update `app/login/page.tsx` with:
  - Signup action/button
  - Loading state during signup
  - Contextual success and error toasts/messages
- Optional dedicated `/signup` page if clarity is better than in-page toggle.

## 10) Security and Validation

- Enforce minimum password requirements (length + basic validation).
- Prevent leaking sensitive auth details in error messages.
- Use existing secure Supabase session handling.
- Keep protected route gating via middleware/auth checks.

## 11) Acceptance Criteria

- New user can register via UI with valid credentials.
- Existing user can still log in successfully.
- Duplicate email shows clear, actionable error.
- Confirmation-required flow provides clear instructions.
- Protected routes remain inaccessible when unauthenticated.

## 12) Metrics

- Signup completion rate.
- Login success rate post-signup.
- Auth-related error rate on `/login`.

## 13) Risks and Mitigations

- **Risk:** Confusing login/signup UI.
  - **Mitigation:** clear CTA labels and minimal branching.
- **Risk:** Environment/config mismatch for auth redirects.
  - **Mitigation:** document required Supabase URL settings per environment.
- **Risk:** Weak passwords.
  - **Mitigation:** basic client validation with Supabase-enforced auth constraints.

## 14) Open Questions

- Should signup live on `/login` with tabs, or a dedicated `/signup` route?
- Should we require email verification before first dashboard access in V1?
- Do we want password strength hints/UI now or later?
