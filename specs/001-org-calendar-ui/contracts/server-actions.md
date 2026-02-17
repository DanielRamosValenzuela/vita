# Server Actions Contract: Organizational Calendar

**Date**: 2026-02-16
**Location**: `src/features/admin-hr/api/calendar-actions.ts`

All actions use `requireAdminHRWithOrg()` for auth and return `ActionResult<T>`.

## Existing Actions (to modify)

### getOrganizationCalendarAction

**Status**: Exists, minor enhancement needed (accept year range for import conflict detection).

```typescript
// Current signature (keep as-is)
async function getOrganizationCalendarAction(
  year: number,
  month: number
): Promise<ActionResult<OrganizationCalendarDay[]>>

// Return: calendar days for the given month, filtered by organizationId
```

### upsertCalendarDayAction

**Status**: Exists, needs Zod validation added.

```typescript
// Modify to use Zod schema
async function upsertCalendarDayAction(
  data: CalendarDayInput // Zod-validated
): Promise<ActionResult<OrganizationCalendarDay>>

// Zod schema: calendarDaySchema
// - date: z.date()
// - type: z.enum(['HOLIDAY', 'IRRENUNCIABLE', 'ORGANIZATION_HOLIDAY', 'CUSTOM'])
// - name: z.string().max(100).optional()
// - description: z.string().max(500).optional()
// - multiplier: z.number().min(0.1)
```

### deleteCalendarDayAction

**Status**: Exists, works correctly. No changes needed.

```typescript
async function deleteCalendarDayAction(dayId: string): Promise<ActionResult<void>>
```

### bulkMarkDaysAction

**Status**: Exists but not used by import feature. Will be superseded by new importNationalHolidaysAction for the import flow.

## New Action

### importNationalHolidaysAction

**Purpose**: Bulk import selected national holidays for a given year.

```typescript
async function importNationalHolidaysAction(
  data: ImportHolidaysInput
): Promise<ActionResult<{ imported: number; skipped: number }>>

// Input schema: importHolidaysSchema
// - year: z.number().min(2024).max(2030)
// - countryCode: z.enum(['CL', 'CO', 'PE', 'AR', 'MX'])
// - selectedHolidays: z.array(z.object({
//     month: z.number().min(1).max(12),
//     day: z.number().min(1).max(31),
//     name: z.string(),
//     type: z.enum(['HOLIDAY', 'IRRENUNCIABLE']),
//     multiplier: z.number().min(0.1)
//   }))

// Implementation:
// 1. Auth: requireAdminHRWithOrg()
// 2. Validate with Zod
// 3. For each selected holiday:
//    - Construct full date: new Date(year, month - 1, day)
//    - Use createMany with skipDuplicates OR individual upserts
// 4. Return count of imported vs skipped (already existing)
// 5. revalidatePath('/dashboard/calendar')
```

### getCalendarYearSummaryAction (optional, for month summary)

**Purpose**: Get count of special days per type for a given year (for summary badges).

```typescript
async function getCalendarYearSummaryAction(
  year: number
): Promise<ActionResult<Record<string, number>>>

// Returns: { HOLIDAY: 5, IRRENUNCIABLE: 3, ORGANIZATION_HOLIDAY: 2, CUSTOM: 1 }
// Used by: month summary component
// Note: Could also be computed client-side from existing getOrganizationCalendarAction data
```

## Zod Schemas

**Location**: `src/features/admin-hr/lib/calendar-schemas.ts`

```typescript
import { z } from 'zod'

export const calendarDaySchema = z.object({
  date: z.date(),
  type: z.enum(['HOLIDAY', 'IRRENUNCIABLE', 'ORGANIZATION_HOLIDAY', 'CUSTOM']),
  name: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  multiplier: z.number().min(0.1, 'Multiplier must be at least 0.1'),
})

export const importHolidaysSchema = z.object({
  year: z.number().min(2024).max(2030),
  countryCode: z.enum(['CL', 'CO', 'PE', 'AR', 'MX']),
  selectedHolidays: z
    .array(
      z.object({
        month: z.number().min(1).max(12),
        day: z.number().min(1).max(31),
        name: z.string(),
        type: z.enum(['HOLIDAY', 'IRRENUNCIABLE']),
        multiplier: z.number().min(0.1),
      })
    )
    .min(1, 'Select at least one holiday'),
})

export type CalendarDayInput = z.infer<typeof calendarDaySchema>
export type ImportHolidaysInput = z.infer<typeof importHolidaysSchema>
```
