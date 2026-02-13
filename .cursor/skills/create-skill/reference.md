# Create Skill — Reference

Extended guidance for skill authoring. See [SKILL.md](SKILL.md) for the template and structure.

---

## Directory layout

```
skill-name/
├── SKILL.md       # Required — main instructions + "When to use"
├── reference.md   # Optional — long reference, tables, examples
├── examples.md    # Optional — usage examples
└── scripts/       # Optional — runnable scripts
```

## Storage

| Type     | Path                   | Scope             |
| -------- | ---------------------- | ----------------- |
| Personal | ~/.cursor/skills/name/ | All your projects |
| Project  | .cursor/skills/name/   | Repo only         |

Do **not** create skills under `~/.cursor/skills-cursor/`; that is reserved for Cursor.

---

## "When to use" section rules

1. **Placement**: First section after the main title. Use a horizontal rule (`---`) before the next section.
2. **Format**: Level-2 heading `## When to use`, then a short intro line and a bullet list.
3. **Content**: 3–7 concrete triggers (user actions, file types, keywords). Be specific so the agent can match.
4. **Language**: English only.

**Example:**

```markdown
## When to use

Apply this skill when:

- Designing or redesigning screens or components
- Reviewing or improving styles (CSS, Tailwind, design system)
- Working on HTML semantics or accessibility (a11y)
- The user mentions UI, UX, design, styling, or usability
```

---

## Anti-patterns

- **Vague description**: "Helps with code" → use "Applies X when Y. Use when Z."
- **First/second person in description**: "I help…" / "You can use…" → use third person.
- **Missing trigger terms**: Add keywords the user or codebase might mention.
- **"When to use" buried**: Keep it at the top; do not put long intro content before it.
- **Mixed languages**: Use English for all skill content (title, sections, bullets).
