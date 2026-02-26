# Quickstart: Sectores Feature Implementation

**Branch**: `001-area-sectors`
**Estimated files**: ~25 new, ~5 modified

## Pre-requisites

1. Be on branch `001-area-sectors`
2. Ensure `npm run build` passes on current state
3. Have Supabase MCP available for migrations

## Implementation Order

### Phase 1: Database & Schema (15 min)

1. **Supabase migration**: Create `Sector` table and `SectorArea` junction table
2. **Prisma schema**: Add `Sector` and `SectorArea` models, add back-relations to `Organization` and `Area`
3. **Generate**: `npx prisma generate`
4. **Verify**: `npm run build` passes

### Phase 2: Entity Layer (20 min)

1. Create `src/entities/sector/lib/sector-repository.ts`:
   - `getSectors(organizationId)` — with _count and sectorAreas include
   - `getSectorById(id, organizationId)` — with areas detail
   - `createSector(data, organizationId)`
   - `updateSector(id, data, organizationId)`
   - `deleteSector(id, organizationId)`
2. Create `src/entities/sector/index.ts` — re-export repository functions

### Phase 3: Feature Layer — Schemas & Types (15 min)

1. Create Zod schemas: `src/features/sector/lib/schemas/sector-schema.ts`
2. Create validation messages: `src/features/sector/lib/validation/`
3. Create types: `src/features/sector/lib/types.ts`
4. Create server/client schema helpers: `src/features/sector/lib/helpers/`

### Phase 4: Feature Layer — Server Actions (30 min)

1. Create `src/features/sector/api/sector-actions.ts`:
   - `createSectorAction` — ADMIN_HR only
   - `updateSectorAction` — ADMIN_HR only
   - `deleteSectorAction` — ADMIN_HR only
   - `getSectorsAction` — All roles, role-filtered
   - `assignAreasToSectorAction` — ADMIN_HR only
2. Create `src/features/sector/api/sector-staff-actions.ts`:
   - `getSectorStaffAction` — All roles, role-filtered, time overlap query
3. Create `src/features/sector/api/index.ts` — re-exports

### Phase 5: Translations (15 min)

1. Add keys to `messages/es.json`:
   - `sectors.*` — CRUD labels, form fields, table columns
   - `dashboard.sectors` — sidebar label
   - `validation.sector.*` — form validation messages
2. Mirror to `messages/en.json`

### Phase 6: Feature Layer — UI Components (45 min)

1. `src/features/sector/ui/sectors-table.tsx` — List with search, pagination, delete confirmation
2. `src/features/sector/ui/create-sector-form.tsx` — Name, description, icon, color
3. `src/features/sector/ui/sector-basic-info-card.tsx` — Edit basic info
4. `src/features/sector/ui/sector-areas-card.tsx` — Assign/remove areas with multi-select
5. `src/features/sector/ui/sector-staff-query.tsx` — Date + time range picker, grouped results
6. `src/features/sector/ui/index.ts` — re-exports

### Phase 7: Routes & Navigation (20 min)

1. Create route pages:
   - `app/[locale]/dashboard/sectors/page.tsx` — List page
   - `app/[locale]/dashboard/sectors/new/page.tsx` — Create page
   - `app/[locale]/dashboard/sectors/[id]/edit/page.tsx` — Edit + assign areas
   - `app/[locale]/dashboard/sectors/[id]/staff/page.tsx` — Staff query page
2. Add sidebar nav item in `src/widgets/dashboard-sidebar/constants.ts`

### Phase 8: Verification (10 min)

1. `npx prisma generate` — no errors
2. `npm run build` — compiles clean
3. `npm run lint` — no ESLint errors
4. Manual verification in browser

## Key Patterns to Follow

- **Auth**: `requireAdminHRWithOrg()` for write actions, custom role check for reads
- **i18n**: All strings via `useTranslations` / `getTranslations`
- **Multi-tenant**: Always filter by `organizationId`
- **ActionResult**: `{ success, data?, error?, message? }`
- **Revalidation**: `revalidatePaths('/dashboard/sectors', '/dashboard/admin-hr')`
- **Junction table**: Compound `@@id`, cascade deletes, transaction for bulk assignment
- **Overlap query**: Three-part OR clause matching `shift-validation.ts` pattern

## Files Summary

| Layer | Directory | New Files |
| ----- | --------- | --------- |
| Entity | `src/entities/sector/` | 2 |
| Feature API | `src/features/sector/api/` | 3 |
| Feature Lib | `src/features/sector/lib/` | ~8 |
| Feature UI | `src/features/sector/ui/` | 6 |
| Routes | `app/[locale]/dashboard/sectors/` | 4 |
| i18n | `messages/` | 2 (modified) |
| Schema | `prisma/` | 1 (modified) |
| Sidebar | `src/widgets/dashboard-sidebar/` | 1 (modified) |
