# AGENTS.md

# DevTrack AI - AI Agent Instructions

Version: 1.0

---

# Project Overview

DevTrack AI is a production-ready full-stack SaaS platform that helps students and developers manage their complete career journey.

The application includes:

- Dashboard
- Profile
- Resume Builder
- ATS Analyzer
- Portfolio Manager
- Project Tracker
- DSA Tracker
- Interview Preparation
- AI Career Coach
- Analytics
- Settings
- Admin Panel

This is NOT a demo project.

Every implementation should be production-ready.

---

# Agent Behavior

The AI agent is expected to behave like a senior software engineer working on a long-term production SaaS project.

Always prioritize correctness, maintainability, and consistency over speed.

---

## Before Writing Code

Always:

- Read the relevant documentation inside the `docs/` folder.
- Understand the current feature before making changes.
- Check existing implementations before creating new ones.
- Follow the established architecture.
- Think through edge cases before coding.

Never start coding without understanding the task.

---

## During Implementation

Implement only the requested feature.

Never:

- Rewrite unrelated code.
- Refactor unrelated modules.
- Rename files unnecessarily.
- Change architecture without approval.
- Install new libraries unless required.
- Introduce breaking changes.

Keep changes as small and focused as possible.

---

## Existing Code

Treat existing working code as stable.

Never modify working code unless:

- A bug must be fixed.
- A documented improvement requires it.
- The user explicitly requests a refactor.

Preserve backward compatibility whenever possible.

---

## Decision Making

If multiple valid solutions exist:

Choose the one that is:

1. Simpler
2. Easier to maintain
3. More scalable
4. Better documented
5. More type-safe

Avoid clever or overly complex solutions.

---

## Scope Control

Stay within the requested scope.

Do not implement additional features simply because they seem useful.

If an improvement is identified, mention it separately instead of implementing it automatically.

---

## Code Quality

Every change should improve one or more of:

- Readability
- Performance
- Security
- Maintainability
- Accessibility
- Developer Experience

Never decrease code quality to save time.

---

## Error Prevention

Before finishing any task, verify:

- No TypeScript errors
- No lint errors
- No broken imports
- No duplicate code
- No unused files
- No console logs left behind
- No TODO placeholders unless requested

---

## Communication

If requirements are unclear:

Stop.

Explain the ambiguity.

Request clarification instead of making assumptions.

Never guess business logic.

---

## Documentation

If implementation changes architecture or behavior,

update the relevant documentation.

Documentation should always remain synchronized with implementation.

---

## Final Verification Checklist

Before considering any task complete, verify:

✓ Feature works correctly

✓ Existing features still work

✓ Responsive layout

✓ Loading state implemented

✓ Empty state implemented

✓ Error state implemented

✓ Validation implemented

✓ Accessibility maintained

✓ Security checks completed

✓ Performance considered

✓ TypeScript passes

✓ Build succeeds

Only after all checks pass should the task be considered complete.

# Primary Objective

Every code change must improve one of these:

- Maintainability
- Scalability
- Performance
- Security
- User Experience

Never prioritize speed over quality.

---

# Documentation First

Before implementing anything, always consult the documentation inside the `docs/` folder.

The documents are the single source of truth.

Never invent architecture that conflicts with documentation.

---

# Tech Stack

Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- React Hook Form
- Zod
- Zustand
- TanStack Query

Backend

- Node.js
- Express.js
- TypeScript

Database

- PostgreSQL
- Drizzle ORM

Authentication

- Better Auth

Storage

- Cloudinary

AI

- Google Gemini

Deployment

- Vercel
- Render
- Neon

Do not replace technologies without explicit instruction.

---

# Coding Standards

Always

- Use TypeScript
- Use strict typing
- Prefer reusable code
- Use async/await
- Write readable code
- Keep functions focused
- Separate UI from business logic

Never

- Use "any"
- Hardcode secrets
- Duplicate business logic
- Mix UI and backend logic
- Ignore TypeScript errors

---

# Architecture Rules

Frontend

- Components must remain reusable.
- Business logic belongs in hooks or services.
- Pages should stay lightweight.

Backend

- Routes
- Controllers
- Services
- Repositories

must remain separated.

Database access should only occur inside repositories.

---

# UI Rules

Always

- Mobile first
- Responsive
- Accessible
- Dark mode compatible
- Light mode compatible

Every page must include

- Loading state
- Empty state
- Error state
- Success feedback

---

# Design Rules

Keep UI

- Minimal
- Modern
- Professional

Avoid

- Fancy gradients
- Heavy animations
- Visual clutter

Use spacing consistently.

---

# API Rules

Every endpoint

- Validates input
- Validates permissions
- Returns consistent JSON
- Uses proper HTTP status codes
- Handles errors gracefully

---

# Database Rules

Every table

- UUID primary key
- created_at
- updated_at

Never

- Duplicate business data
- Remove foreign keys
- Break relationships

---

# Authentication Rules

Protected routes must always verify authentication.

Never trust frontend validation.

Always validate permissions on the server.

---

# Security Rules

Never

- Expose secrets
- Trust client input
- Store passwords in plain text
- Expose internal errors

Always

- Validate input
- Sanitize uploads
- Check authorization
- Protect sensitive routes

---

# Performance Rules

Prefer

- Lazy loading
- Memoization where appropriate
- Optimized queries
- Pagination
- Image optimization

Avoid

- Unnecessary renders
- Large API payloads
- Duplicate requests

---

# Accessibility Rules

Support

- Keyboard navigation
- Screen readers
- Proper labels
- Visible focus states

Accessibility is required.

---

# Reusable Components

Before creating a new component,

check whether an existing component can be reused.

Duplicate UI should be avoided.

---

# Error Handling

Errors should

- Be user-friendly
- Be logged
- Never expose stack traces
- Provide recovery options

---

# Folder Rules

Do not create random folders.

Follow the documented folder structure.

Keep related files together.

---

# Dependencies

Do not install new packages unless absolutely necessary.

Prefer existing libraries already defined in the documentation.

---

# Git Rules

Keep commits

- Small
- Focused
- Descriptive

Never mix unrelated changes.

---

# AI Implementation Rules

When implementing features:

1. Read the relevant document.
2. Build only that feature.
3. Do not modify unrelated modules.
4. Keep backward compatibility.
5. Preserve existing functionality.

---

# Before Finishing Any Task

Verify

- Code compiles
- No lint errors
- Responsive layout
- Types are correct
- API works
- Database works
- Documentation remains accurate

---

# Definition of Done

A task is complete only if

- Feature works
- UI is responsive
- Types are correct
- Validation exists
- Loading state exists
- Empty state exists
- Error handling exists
- Code is reusable
- Accessibility is preserved
- No existing functionality is broken

---

# Final Principle

DevTrack AI should be built like a real production SaaS.

Every decision should prioritize long-term quality over short-term convenience.

If documentation and implementation conflict, documentation takes precedence until explicitly updated.