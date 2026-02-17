# Research: UI para Gestión del Calendario Organizacional

**Date**: 2026-02-16
**Feature Branch**: `001-org-calendar-ui`

## 1. Existing Implementation Audit

**Decision**: Build on existing code rather than rewrite.

**Rationale**: The feature is ~60% implemented. The Prisma model, route, sidebar, Server Actions (get/upsert/delete/bulkMark), and basic calendar view already exist and follow project patterns correctly.

**What exists**:

- `OrganizationCalendar` model in Prisma with `@@unique([organizationId, date])`
- `DayType` enum: NORMAL, WEEKEND, SATURDAY, SUNDAY, HOLIDAY, IRRENUNCIABLE, ORGANIZATION_HOLIDAY, CUSTOM
- Route: `app/[locale]/dashboard/calendar/page.tsx` with `requireAdminHRWithOrg`
- Server Actions: `getOrganizationCalendarAction`, `upsertCalendarDayAction`, `deleteCalendarDayAction`, `bulkMarkDaysAction`
- UI: `OrganizationCalendarView` (widget), `OrganizationCalendarPage` + `CalendarDayForm` (feature)
- i18n: `adminHR.calendar.*` keys in es.json (lines 1604-1649)
- Sidebar entry for `/dashboard/calendar` (ADMIN_HR only)

**What's missing (gaps to fill)**:

1. Form uses Dialog, spec requires Sheet (drawer lateral)
2. No delete button in UI (action exists but CalendarDayForm doesn't expose it)
3. No month summary/statistics component
4. No national holiday bulk import UI (bulkMarkDaysAction exists but no holiday datasets or selection UI)
5. Calendar view has hardcoded Spanish day names (constitution violation: i18n)
6. Multiplier validation allows 0 (spec requires >= 0.1)
7. No Zod schema validation in Server Actions (using manual parseFloat)
8. No AlertDialog for delete confirmation

**Alternatives considered**: Creating a new `features/calendar/` or `entities/organization-calendar/` — rejected because the existing code is well-organized in `features/admin-hr/` and moving it would create unnecessary churn with no architectural benefit.

## 2. Dialog to Sheet Migration

**Decision**: Replace `Dialog` with `Sheet` (side="right") in `CalendarDayForm`.

**Rationale**: Clarification session specified Sheet to keep calendar visible. Shadcn Sheet is already available in the project (`src/shared/ui/sheet`). The migration is straightforward — same form content, different wrapper component.

**Pattern**: Import `Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription` from `@/src/shared/ui/sheet`. Use `side="right"` for lateral drawer. The form content stays identical.

## 3. National Holiday Data Architecture

**Decision**: Static TypeScript datasets per country in `shared/lib/constants/holidays/`.

**Rationale**: ~18-20 holidays per country per year. Static data avoids external API dependency, is versioned with code, and is type-safe. Supporting 5 countries × 3 years = ~300 entries total — trivially small.

**Data structure**:

```typescript
interface NationalHoliday {
  month: number // 1-12
  day: number // 1-31
  name: string // i18n key reference
  nameEs: string // Spanish name (fallback)
  nameEn: string // English name (fallback)
  type: 'HOLIDAY' | 'IRRENUNCIABLE'
  defaultMultiplier: number
}
```

Using month/day (not full dates) allows reuse across years. The import action constructs full dates from year + month + day.

**Countries**: Chile (CL), Colombia (CO), Peru (PE), Argentina (AR), Mexico (MX). Chile is most detailed (includes irrenunciables); others have HOLIDAY type only.

**Alternatives considered**: External API (nager.date, etc.) — rejected per spec assumption of static embedded data. JSON files — rejected in favor of TypeScript for type safety and tree-shaking.

## 4. Bulk Import UX Pattern

**Decision**: Dialog with country auto-detected, year selector, checkbox list of holidays, and "Import Selected" button.

**Rationale**: Import is a one-time setup action per year, not a frequent interaction. A Dialog (not Sheet) is appropriate here since it's a modal workflow separate from the calendar view. Checkboxes allow selective import. Already-existing holidays are shown as disabled/checked.

**Flow**:

1. User clicks "Import Holidays" button in calendar page header
2. Dialog opens with year selector (default: current year) and country auto-detected from organization
3. Holiday list loads with checkboxes. Already-existing dates shown as "Already imported" (disabled)
4. User selects desired holidays and clicks "Import"
5. `importNationalHolidaysAction` creates entries via `prisma.organizationCalendar.createMany` with skipDuplicates
6. Toast shows count of imported holidays
7. Calendar refreshes

## 5. Zod Validation Schemas

**Decision**: Add Zod schemas for calendar day create/edit and import operations.

**Rationale**: Consistent with project convention (useFormAction + Zod). Currently `CalendarDayForm` uses manual `parseFloat` validation. Zod centralizes validation rules and enables server-side + client-side reuse.

**Schemas**:

- `calendarDaySchema`: date (Date), type (DayType enum), name (optional string), description (optional string), multiplier (number, min 0.1)
- `importHolidaysSchema`: year (number, min 2024, max 2030), countryCode (enum of supported countries), holidayIndices (array of numbers)

## 6. i18n Fix for Calendar View

**Decision**: Replace hardcoded `['Dom', 'Lun', 'Mar', ...]` with `t('weekdays.sun')` etc.

**Rationale**: Constitution Principle II mandates no literal text in JSX. The existing implementation has hardcoded Spanish weekday abbreviations in `organization-calendar-view.tsx` line 91. Must use next-intl keys.

**New i18n keys**: `adminHR.calendar.weekdays.{sun,mon,tue,wed,thu,fri,sat}` in both es.json and en.json.
