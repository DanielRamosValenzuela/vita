# FASE 12 - Validation Report

**Date:** 2026-03-10
**Environment:** http://localhost:3000 (locale: es)
**Organization:** Clinica Ejemplo Santiago (ID: `cmmkvt4ql000xjgull3yfd6n5`)
**Tester:** Automated (agent-browser + Supabase MCP)

---

## 12.1 Dashboard ADMIN_HR Metrics

**User:** Valentina Rojas Perez (vita.qa.adminhr1@gmail.com) — Role: ADMIN_HR
**URL:** /es/dashboard/admin-hr

### Screenshots
- `screenshots/fase12-admin-hr-dashboard.png` — Full dashboard top
- `screenshots/fase12-admin-hr-dashboard-scrolled.png` — Limits section + total usage

### Metrics Cards (Top Row)

| Metric | Dashboard Value | Expected | Status |
|---|---|---|---|
| Areas activas | **6** | 6 | DISCREPANCY — see note |
| Tipos de Turno | **10** | N/A (informational) | OK |
| Personal activo | **110** | ~111 (102 STAFF + 8 CHIEF + 1 ADMIN_HR) | DISCREPANCY |
| Contratos con tarifa | **112** | N/A (informational) | OK |
| Turnos Activos (este mes) | **958** | N/A (informational) | OK |

### Limits Section (Organization Limits)

| Role | Current | Limit | Usage % | Available | Status |
|---|---|---|---|---|---|
| Administradores (ADMIN_HR) | **1** | 5 | 20.0% | 4 | PASS |
| Jefes de Area (CHIEF_AREA) | **8** | 10 | 80.0% | 2 | PASS |
| Jefes de Sector (CHIEF_SECTOR) | **0** | 10 | 0.0% | 10 | NOTE |
| Personal (STAFF) | **102** | 150 | 68.0% | 48 | PASS |

**Uso Total de la Organizacion:** 111 de 165 cuentas utilizadas — **67.3%** (54 disponibles)

### Findings

1. **BUG - Areas activas discrepancy:** The dashboard card shows "6 Areas activas", but the database query `SELECT COUNT(*) FROM "Area" WHERE "organizationId" = '...' AND "isActive" = true` returns **0**. All 6 areas have `isActive = false` in the database. The dashboard card appears to be counting total areas (6) rather than filtering by `isActive = true`. Either the card label is misleading or the isActive flag was never set to true during QA seeding.

2. **BUG - Personal count discrepancy:** The dashboard card shows "110 Personal activo" but the database has 111 users in the org (1 ADMIN_HR + 8 CHIEF_AREA + 102 STAFF = 111). The dashboard may be excluding the ADMIN_HR user from the "Personal" count, showing only 110 (8 + 102). This could be intentional design, but the label "Personal activo" is ambiguous.

3. **NOTE - Jefes de Sector limit:** The dashboard shows a "Jefes de Sector" card with limit 10 and 0 current. This reuses the same `maxChiefs` limit (10) as "Jefes de Area". There are no users with role `CHIEF_SECTOR` in the DB. The limit appears to be shared (both CHIEF_AREA and CHIEF_SECTOR count against maxChiefs=10), but they display as separate cards with independent limits of 10 each. This is potentially misleading — the total combined limit should be 10, not 10+10=20.

---

## 12.2 Multi-Area Nutricionistas

### Database Verification

**Nutricionistas area** (ID: `b39295bb-ccc4-4209-a6dd-e630d91c7024`):
- 12 STAFF linked via UserArea
- 4 CHIEF_AREA linked via UserArea:
  - vita.qa.chief.nut1@gmail.com (Diego Herrera Soto)
  - vita.qa.chief.nut2@gmail.com (Isidora Reyes Fuentes)
  - vita.qa.chief.uci1@gmail.com (Rodrigo Sepulveda Diaz)
  - vita.qa.chief.urg1@gmail.com (Camila Fernandez Lagos)

### Chief #6 Test (vita.qa.chief.nut1@gmail.com — Diego Herrera Soto)

**URL:** /es/dashboard/staff
**Screenshot:** `screenshots/fase12-chief-nut1-staff.png`

- Staff page shows: **"16 personas"** (Mostrando 1 a 10 de 16)
- Table shows Nutricionistas area users with correct roles and contracts

### Chief #9 Test (vita.qa.chief.nut2@gmail.com — Isidora Reyes Fuentes)

**URL:** /es/dashboard/staff
**Screenshot:** `screenshots/fase12-chief-nut2-staff.png`

- Staff page shows: **"16 personas"** (Mostrando 1 a 10 de 16)
- Table shows identical Nutricionistas area users

### Result

| Check | Status |
|---|---|
| Both chiefs see same staff count | **PASS** — Both see 16 personas |
| Both chiefs see same staff list | **PASS** — Identical list (same order, same names) |
| Expected 12 Nutricionistas staff visible | **DISCREPANCY** — 16 shown, not 12 |

### Findings

4. **NOTE - Staff count is 16, not 12:** The staff page for Nutricionistas chiefs shows 16 personas instead of the expected 12. The additional 4 are the CHIEF_AREA users also linked to the Nutricionistas area (including chiefs from other areas like UCI and Urgencias who are cross-linked). The 16 = 12 STAFF + 4 CHIEF_AREA. This may be by design (chiefs see all personnel linked to their area including other chiefs), but the expectation was 12.

---

## 12.3 Responsive Navigation

### Code Analysis

The responsive navigation is implemented in `src/widgets/dashboard-sidebar/dashboard-shell.tsx`:

- **Mobile header** (`<header>`): Has class `lg:hidden` — visible only below 1024px (lg breakpoint)
- **Hamburger button**: Uses `lucide-react` `Menu` icon, triggers a Sheet (slide-out drawer)
- **Sheet component**: `<Sheet>` from shadcn/ui, slides from left (`side="left"`), width 72 (w-72)
- **Desktop sidebar**: Wrapped in `<div className="hidden lg:block">` — visible only at/above 1024px

### Browser Verification

| Check | Result |
|---|---|
| `document.querySelector('[data-sidebar]') !== null` | **false** — No `data-sidebar` attribute used |
| `document.querySelectorAll('aside').length` | **1** — One aside element (the sidebar) |
| Mobile header present | **Yes** — `<header class="bg-card border-border fixed...lg:hidden">` exists |
| Mobile header visible at 1280px | **No** — `display: none` (correct, viewport > lg) |
| Sheet-based mobile menu | **Yes** — Uses `Sheet`/`SheetContent` pattern |

### Result

| Check | Status |
|---|---|
| Mobile menu exists | **PASS** — Hamburger + Sheet drawer implemented |
| No `[data-sidebar]` attribute | **NOTE** — Uses custom Sheet pattern, not shadcn Sidebar component |
| Responsive breakpoint correct | **PASS** — lg (1024px) breakpoint separates mobile/desktop |

---

## 12.4 CHIEF_SECTOR Dead Code Analysis

### Database Findings

| Query | Result |
|---|---|
| UserSector records | **3 records** |
| Sector records in org | **2 sectors**: "Unidad de Cuidados Intensivos (UCI)", "Urgencias" |
| Users with CHIEF_SECTOR role | **0** — No user has role=CHIEF_SECTOR |
| Users in UserSector | 3 CHIEF_AREA users (all with role=CHIEF_AREA, not CHIEF_SECTOR) |

**UserSector details:**

| User | Email | Actual Role | Sector |
|---|---|---|---|
| Rodrigo Sepulveda Diaz | vita.qa.chief.uci1@gmail.com | CHIEF_AREA | Unidad de Cuidados Intensivos (UCI) |
| Javer | javer@hospital.infierno.com | CHIEF_AREA | Urgencias |
| Camila Fernandez Lagos | vita.qa.chief.urg1@gmail.com | CHIEF_AREA | Urgencias |

**SectorArea relationships:**

| Sector | Linked Areas |
|---|---|
| UCI | Enfermeria UCI, Medicos UCI, Nutricionistas |
| Urgencias | Nutricionistas, Enfermeria Urgencias, Medicos Urgencias, Tecnicos Urgencias |

### Sidebar "Jefe de Sector" Display Logic

From `app/[locale]/dashboard/layout.tsx` (lines 25-28):

```typescript
user.role === Role.CHIEF_AREA
  ? prisma.userSector
      .count({ where: { userId: user.id } })
      .then((c) => (c > 0 ? Role.CHIEF_SECTOR : undefined))
  : Promise.resolve(undefined),
```

**Logic:** If a user's actual role is `CHIEF_AREA` AND they have at least one `UserSector` record, the sidebar displays `"Jefe de Sector"` instead of `"Jefe de Area"`. This is a **display-only override** — the user's real role remains `CHIEF_AREA`.

From `src/widgets/dashboard-sidebar/index.tsx` (line 70):
```typescript
{tCommon(`roles.${displayRole ?? user.role}`)}
```

### CHIEF_SECTOR vs CHIEF_AREA Functionality Comparison

| Aspect | CHIEF_SECTOR | CHIEF_AREA | Difference |
|---|---|---|---|
| Prisma Role enum | Defined | Defined | Both exist |
| Users with this role | **0** | **8** | No one uses CHIEF_SECTOR |
| Sidebar nav items | Identical access | Identical access | Same menu items for both roles |
| Staff view filter | Listed as option | Listed as option | CHIEF_SECTOR filter exists but matches 0 users |
| Invitation flow | Treated same as CHIEF_AREA | Standard | `inviteChiefAction` handles both |
| Organization limits | Shares `maxChiefs` | Shares `maxChiefs` | Same limit pool |
| RBAC functions | `isChiefSector()` exists | `isChiefArea()` exists | Separate functions, same pattern |
| Auth session checks | Included alongside CHIEF_AREA | Primary | Both pass `requireAdminHROrChief` |
| Dashboard display | Via displayRole override | Default | CHIEF_SECTOR shown only as label for CHIEF_AREA+UserSector |

### Code Locations Referencing CHIEF_SECTOR

1. `prisma/schema.prisma:174` — Role enum definition
2. `src/shared/lib/constants/roles.ts:7` — ROLES constant
3. `src/shared/lib/auth/rbac.ts:18-19` — `isChiefSector()` function
4. `src/shared/lib/auth/session.ts:66,82` — Auth guard checks
5. `src/shared/lib/utils/role-display.ts:17-18` — Display config
6. `src/shared/lib/utils/count-users-by-role.ts:6,14,21` — User counting
7. `src/widgets/dashboard-sidebar/constants.ts` — 10 sidebar nav items include CHIEF_SECTOR in roles array
8. `src/features/admin-hr/ui/staff-view-page.tsx:52,121,154` — Filter and display
9. `src/features/admin-hr/ui/invite-user-form.tsx:125` — Invitation flow
10. `src/features/extra-shifts/api/application-actions.ts:67` — Extra shift approvals
11. `src/entities/organization/lib/organization-usage.ts:53,65` — Limit calculations
12. `src/entities/organization/lib/organization-limits.ts:44` — Limit checks
13. `app/[locale]/dashboard/layout.tsx:28` — displayRole logic
14. `app/[locale]/dashboard/requests/page.tsx:13` — Request approvals
15. `app/[locale]/dashboard/admin-hr/organization/page.tsx:100` — Org page labels

### Result

| Check | Status |
|---|---|
| UserSector records exist | **3 records** (all for CHIEF_AREA users) |
| Sidebar shows "Jefe de Sector" | **Yes** — Only as displayRole for CHIEF_AREA users with UserSector records |
| CHIEF_SECTOR provides additional functionality | **No** — Zero functional difference from CHIEF_AREA |

### Finding

5. **DEAD CODE / DESIGN DEBT — CHIEF_SECTOR role:** `CHIEF_SECTOR` exists as a Prisma enum value and is referenced in ~15+ code locations, but:
   - **No user has role=CHIEF_SECTOR** in the database
   - The role is **never actually assigned** to any user — it is only used as a `displayRole` label override in the sidebar
   - Functionally, it is treated identically to `CHIEF_AREA` everywhere (same nav items, same auth guards, same limit pool)
   - The `UserSector` table is the only differentiator, but it only triggers a cosmetic label change
   - The dashboard "Jefes de Sector" limit card shows 0/10, sharing the same `maxChiefs` limit as CHIEF_AREA, which could mislead admins into thinking they have 20 chief slots (10+10) when they actually have 10 shared
   - **Recommendation:** Either fully implement CHIEF_SECTOR as a distinct role with unique permissions (e.g., cross-area visibility via sectors), or remove it and keep sector assignment as a metadata attribute on CHIEF_AREA users

---

## Summary of Findings

| # | Severity | Section | Description |
|---|---|---|---|
| 1 | BUG | 12.1 | Dashboard shows "6 Areas activas" but all areas have `isActive=false` in DB |
| 2 | BUG | 12.1 | "Personal activo" shows 110 instead of expected 111 (may exclude ADMIN_HR) |
| 3 | NOTE | 12.1 | "Jefes de Sector" limit card shows independent 10 limit, potentially misleading (shared pool with CHIEF_AREA) |
| 4 | NOTE | 12.2 | Staff page shows 16 instead of expected 12 (includes 4 cross-linked chiefs) |
| 5 | DEBT | 12.4 | CHIEF_SECTOR role is dead code — never assigned, no functional difference from CHIEF_AREA |
