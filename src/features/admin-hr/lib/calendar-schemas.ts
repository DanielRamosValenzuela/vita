import { z } from 'zod'

export const calendarDaySchema = z.object({
  date: z.date(),
  type: z.enum([
    'HOLIDAY',
    'IRRENUNCIABLE',
    'ORGANIZATION_HOLIDAY',
    'CUSTOM',
    'NORMAL',
    'WEEKEND',
    'SATURDAY',
    'SUNDAY',
  ]),
  name: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  multiplier: z.number().min(0.1),
  isRecurring: z.boolean().optional(),
})

export const importHolidaysSchema = z.object({
  year: z.number().min(2024).max(2030),
  selectedHolidays: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        title: z.string(),
        inalienable: z.boolean(),
      })
    )
    .min(1),
})

export type ImportHolidaysInput = z.infer<typeof importHolidaysSchema>
