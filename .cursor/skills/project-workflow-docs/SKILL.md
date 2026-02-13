---
name: project-workflow-docs
description: Guides the agent to discover, enumerate, and document project workflows. Use when documenting how flows work end-to-end, creating human-readable and AI-friendly workflow descriptions, or when the user mentions workflow docs, processes, or end-to-end flows.
---

# Project Workflow Docs

## When to use

Apply this skill when:

- The user asks to document or explain the project workflows.
- The user wants to know how many workflows there are and how they work end-to-end.
- The user wants documentation that is both human-readable and AI-friendly for later code development.
- The user mentions "workflows", "flows", "processes", or "end-to-end journeys" for the project.

---

## Goal of this skill

This skill makes the agent:

- Discover and list all relevant workflows in the project (at the right level of abstraction).
- For each workflow, explain how it works from start to finish, in clear language.
- Include enough structure and technical detail so that both:
  - A human (product, dev, or stakeholder) understands the flow.
  - An AI agent can later use the docs to implement or modify code safely.

The output should be a structured document (usually Markdown) that can live in the project docs.

---

## How to use this skill

When this skill is active, the agent should:

1. Clarify the scope (if needed)
   - If the user specifies a scope (e.g. "admin HR workflows" or "shift scheduling workflows"), focus only on that subset.
   - If the user does not specify a scope, cover the main business workflows of the project (from a product perspective).

2. Discover workflows
   - Scan existing documentation (e.g. docs/, architecture docs, roadmap, roles).
   - Scan relevant code areas (e.g. app/, src/features/, src/entities/) to infer flows when docs are missing.
   - Identify workflows as coherent end-to-end processes, such as:
     - "User registration and onboarding"
     - "Admin creates an organization"
     - "HR schedules a shift"
     - "Staff member accepts/rejects a shift"
   - Prefer 5–20 workflows at a meaningful granularity instead of dozens of tiny steps.

3. Create a workflow catalog
   - Start the document with a workflow catalog table or list:
     - Workflow ID or short slug.
     - Human-readable name.
     - Primary actors/roles.
     - Very short description (1–2 lines).
   - Example structure (conceptual, not literal requirement):
     - WF-01 – Create organization – Actor: SUPER_ADMIN – Description: Creates and configures a new organization tenant.
     - WF-02 – Assign HR admin – Actor: SUPER_ADMIN/ADMIN_HR – Description: Grants HR admin role inside an organization.

4. Document each workflow in detail

   For each workflow, create a section with at least:
   - Title
     - ## [WF-XX] <Workflow name>

   - Purpose
     - What problem this workflow solves.
     - Why it exists from a business perspective.

   - Actors and roles
     - Which roles participate (e.g. SUPER_ADMIN, ADMIN_HR, CHIEF_AREA, STAFF_HEALTH).
     - Which systems/services participate (e.g. Auth, DB, external APIs).

   - Preconditions
     - What must already be true (e.g. "User must be authenticated and have ADMIN_HR role", "Organization must exist").

   - Inputs
     - Key data inputs (forms, parameters, entities being edited).
     - Note where the data comes from (user form, previous workflow, background job, etc.).

   - Main flow (step-by-step)
     - List the happy path as numbered steps.
     - Describe what happens at each step in functional terms, not only UI.
     - When relevant, reference:
       - Important UI entry points (routes, pages, components).
       - Important server actions, services, or entities.

   - Alternative flows and edge cases
     - Special branches (e.g. validation errors, missing permissions, conflicting state).
     - Describe how the system behaves and what the user sees.

   - Outputs and postconditions
     - What is produced or changed (e.g. new records, state changes, notifications).
     - What guarantees hold after the workflow finishes.

   - Key data models and relations
     - Mention the core entities involved (e.g. Organization, Area, Shift, User).
     - Describe relevant relations at a high level (e.g. "a Shift belongs to a User and an Area").

   - Implementation hints for AI
     - Explicitly highlight:
       - Where in the codebase this workflow is implemented (modules, routes, features).
       - Conventions or patterns that must be respected (e.g. FSD layers, server actions, auth guards, form patterns).
       - Any non-obvious constraints that a coding agent must know before changing this flow.

5. Link workflows to code and docs
   - Whenever possible, provide:
     - Route examples: e.g. /dashboard/shifts, /dashboard/areas.
     - Feature/entity modules: e.g. src/features/shifts/, src/entities/organization/.
     - Existing docs: link to relevant docs/\*.md sections if they deepen understanding.
   - The goal is that a future AI agent can jump from the workflow docs to the exact parts of the code or docs it needs.

6. Keep language and structure consistent
   - Use consistent headings and ordering across all workflows.
   - Use concise, neutral, and technical English.
   - Avoid project-specific slang; prefer clear domain language (e.g. "shift", "area", "contract" if those are domain terms).

---

## Recommended document structure

When generating workflow documentation, the agent should aim for a file structured roughly like:

- # Project Workflows
  - Short introduction (1–3 paragraphs) about what this document is and how to read it.

- ## Workflow Catalog
  - Table or bullet list of all workflows with IDs, names, actors, and short descriptions.

- ## [WF-01] <Workflow name>
  - Purpose
  - Actors and roles
  - Preconditions
  - Inputs
  - Main flow (steps)
  - Alternative flows and edge cases
  - Outputs and postconditions
  - Key data models and relations
  - Implementation hints for AI

- ## [WF-02] <Workflow name>
  - Same structure as above.

- (…repeat for all workflows…)

This structure should be stable over time, so new workflows can be appended in the same format.

---

## Checklist

- [ ] Identified and listed all relevant workflows in a catalog.
- [ ] For each workflow, described purpose, actors, preconditions, inputs, main flow, alternatives, and outputs.
- [ ] Linked each workflow to the key routes, features, entities, and docs in the codebase.
- [ ] Added "Implementation hints for AI" so future agents can safely modify or extend the workflow.
- [ ] Used clear and consistent English headings and structure.

## Additional resources (optional)

- If the project has existing architecture or product docs, reference them explicitly in the generated workflow doc (e.g. See architecture overview for domain context.).
- Consider creating a dedicated workflows/ section in the docs where these files will live.
