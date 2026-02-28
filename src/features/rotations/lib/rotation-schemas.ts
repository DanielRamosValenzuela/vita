import { z } from "zod";

export const createRotationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  areaId: z.string().min(1),
  startDate: z.coerce.date().optional(),
  steps: z
    .array(
      z.object({
        order: z.number().int().min(0),
        isRestDay: z.boolean(),
        shiftTypeId: z.string().optional(),
      }),
    )
    .min(2)
    .max(8),
  shiftConfigs: z.array(
    z.object({
      shiftTypeId: z.string().min(1),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
    }),
  ),
  groups: z
    .array(
      z.object({
        name: z.string().min(1).max(20),
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#3b82f6'),
        icon: z.string().max(30).default('Users'),
      }),
    )
    .min(2)
    .max(6),
});

export const updateRotationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]).optional(),
  startDate: z.coerce.date().optional().nullable(),
  steps: z
    .array(
      z.object({
        order: z.number().int().min(0),
        isRestDay: z.boolean(),
        shiftTypeId: z.string().optional(),
      }),
    )
    .min(2)
    .max(8)
    .optional(),
  shiftConfigs: z
    .array(
      z.object({
        shiftTypeId: z.string().min(1),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
      }),
    )
    .optional(),
});

export const addMembersBulkSchema = z.object({
  rotationGroupId: z.string().min(1),
  userIds: z.array(z.string().min(1)).min(1).max(50),
});

export const removeMemberSchema = z.object({
  rotationGroupId: z.string().min(1),
  userId: z.string().min(1),
});

export const generateShiftsSchema = z.object({
  rotationId: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  overrideConflicts: z.boolean().default(false),
  startingGroupId: z.string().optional(),
});

export const previewGenerationSchema = z.object({
  rotationId: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  startingGroupId: z.string().optional(),
});

export const regenerateShiftsSchema = z.object({
  rotationId: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  replaceExisting: z.boolean().default(false),
  startingGroupId: z.string().optional(),
});

export const getExtraCandidatesSchema = z.object({
  areaId: z.string().min(1),
  date: z.coerce.date(),
  shiftTypeId: z.string().min(1),
  rotationGroupId: z.string().optional(),
});

export const assignExtraShiftSchema = z.object({
  userId: z.string().min(1),
  areaId: z.string().min(1),
  shiftTypeId: z.string().min(1),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  rotationId: z.string().optional(),
  notes: z.string().optional(),
});
