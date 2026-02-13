---
name: create-skill
description: Guides creation of Cursor Agent Skills using a standard template. Use when the user wants to create, write, or author a new skill, or asks about skill structure, SKILL.md format, or "when to use" for skills.
---

# Create Skill (Template)

## When to use

Apply this skill when:

- The user asks to **create** or **write** a new skill
- The user asks for a **template** or **structure** for skills
- The user mentions **skill format**, **SKILL.md**, or **when to use** for skills
- The user wants to **standardize** or **unify** how skills are written in the project

---

## Standard skill structure

Every skill must follow this layout. Use **English** for titles, section names, and content.

### 1. Frontmatter (required)

```yaml
---
name: kebab-case-skill-name
description: [Third person] What the skill does. Use when [trigger scenario 1], [trigger scenario 2], or when the user mentions [keywords].
---
```

- **name**: lowercase, hyphens only, max 64 chars.
- **description**: Third person. Include **WHAT** (capabilities) and **WHEN** (trigger terms). The agent uses this to decide when to apply the skill.

### 2. Body: mandatory sections

```markdown
# Skill Title (English)

## When to use

Apply this skill when:

- [Trigger 1: e.g. "Designing or implementing interfaces"]
- [Trigger 2: e.g. "User mentions UI, UX, or accessibility"]
- [Trigger 3: specific scenario or keyword]

---

## [Main content sections...]

## Checklist (optional)

- [ ] Item 1
- [ ] Item 2

## Additional resources (optional)

- For more detail, see [reference.md](reference.md).
```

- **When to use** must be the **first section** after the title. It is the primary trigger list; keep it explicit and scannable.
- Use `---` to separate "When to use" from the rest.
- All section titles and body text in **English**.

### 3. Optional files

- **reference.md**: Long reference, examples, or tables. Link from SKILL.md.
- **examples.md**: Usage examples. Link from SKILL.md.
- **scripts/**: Only if the skill needs runnable scripts.

---

## Description rules

1. **Third person**: "Applies X when…" / "Use when…" — not "I help" or "You can use".
2. **Trigger terms**: Include words the user or code might mention (e.g. "FSD", "accessibility", "server actions").
3. **WHAT + WHEN**: One sentence on what the skill does, then "Use when…" with scenarios.

**Examples:**

```yaml
# Good
description: Applies Feature-Sliced Design when structuring React/Next.js code. Use when organizing layers, placing new modules, or when the user mentions FSD or slice architecture.

# Good
description: Applies UI/UX and accessibility best practices. Use when designing interfaces, improving styles, or when the user mentions UI, UX, design, semantics, or a11y.
```

---

## Copy-paste template (new skill)

Use this to start a new skill. Fill in `[brackets]` and keep "When to use" as the first section.

```markdown
---
name: [kebab-case-skill-name]
description: [Third person] [What it does]. Use when [scenario 1], [scenario 2], or when the user mentions [keywords].
---

# [Skill Title]

## When to use

Apply this skill when:

- [Specific trigger 1]
- [Specific trigger 2]
- [Specific trigger 3 or keyword]

---

## [First main section]

[Content.]

## [Second main section]

[Content.]

## Checklist (optional)

- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Additional resources (optional)

- See [reference.md](reference.md) for [what it contains].
```

---

## Checklist before finalizing a skill

- [ ] **name**: kebab-case, no spaces or underscores.
- [ ] **description**: Third person, WHAT + WHEN, trigger terms.
- [ ] **When to use**: First section in body; bullet list of clear triggers.
- [ ] **Language**: All content in English.
- [ ] **SKILL.md** under ~500 lines; move long content to reference.md.
- [ ] No Windows-style paths (use `reference.md`, not `reference\file.md`).
