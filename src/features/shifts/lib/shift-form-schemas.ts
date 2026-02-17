import { z } from 'zod'

export function createShiftSchema(t: (key: string) => string) {
  return z.object({
    title: z.string().optional(),
    userId: z.string().min(1, t('userRequired')),
    areaId: z.string().min(1, t('areaRequired')),
    shiftTypeId: z.string().min(1, t('shiftTypeRequired')),
    startDate: z.date({
      error: t('startDateRequired'),
    }),
    startTime: z.string().min(1, t('startTimeRequired')),
    endDate: z.string().optional(),
    endTime: z.string().min(1, t('endTimeRequired')),
    notes: z.string().optional(),
  })
}

export type ShiftFormData = z.infer<ReturnType<typeof createShiftSchema>>
