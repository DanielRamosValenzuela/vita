import { daysBetween, getStepForDay } from "./rotation-helpers";

type RotationStepInput = {
  order: number;
  isRestDay: boolean;
  shiftTypeId: string | null;
  shiftTypeName: string | null;
  shiftTypeColor: string | null;
  minStaffRequired: number;
};

export type RotationGroupInput = {
  id: string;
  name: string;
  cycleOffset: number;
  memberCount: number;
};

export type RotationInput = {
  id: string;
  name: string;
  startDate: Date | null;
  steps: RotationStepInput[];
  groups: RotationGroupInput[];
};

export type CoverageDayResult = {
  date: Date;
  groups: Array<{
    groupId: string;
    groupName: string;
    stepType: "shift" | "rest";
    shiftType?: { id: string; name: string; color: string };
    memberCount: number;
    minStaffRequired: number;
    isUnderstaffed: boolean;
    hasGeneratedShifts: boolean;
  }>;
  totalOnDuty: number;
  hasGap: boolean;
};

export function calculateCoverage(
  rotation: RotationInput,
  startDate: Date,
  endDate: Date,
): CoverageDayResult[] {
  const sortedSteps = [...rotation.steps].sort((a, b) => a.order - b.order);
  const patternLength = sortedSteps.length;

  if (patternLength === 0) return [];

  const effectiveOrigin = rotation.startDate ?? startDate;
  const results: CoverageDayResult[] = [];

  const totalDays = daysBetween(startDate, endDate);

  for (let offset = 0; offset <= totalDays; offset++) {
    const currentDate = new Date(
      Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate() + offset,
      ),
    );

    const dayIndex = daysBetween(effectiveOrigin, currentDate);

    const groupResults: CoverageDayResult["groups"] = rotation.groups.map(
      (group) => {
        const stepIndex = getStepForDay(
          patternLength,
          group.cycleOffset,
          dayIndex,
        );
        const step = sortedSteps[stepIndex];

        if (step.isRestDay)
          return {
            groupId: group.id,
            groupName: group.name,
            stepType: "rest",
            memberCount: group.memberCount,
            minStaffRequired: step.minStaffRequired,
            isUnderstaffed: false,
            hasGeneratedShifts: false,
          };

        const shiftType =
          step.shiftTypeId !== null &&
          step.shiftTypeName !== null &&
          step.shiftTypeColor !== null
            ? {
                id: step.shiftTypeId,
                name: step.shiftTypeName,
                color: step.shiftTypeColor,
              }
            : undefined;

        return {
          groupId: group.id,
          groupName: group.name,
          stepType: "shift",
          shiftType,
          memberCount: group.memberCount,
          minStaffRequired: step.minStaffRequired,
          isUnderstaffed: group.memberCount < step.minStaffRequired,
          hasGeneratedShifts: false,
        };
      },
    );

    const totalOnDuty = groupResults.reduce(
      (sum, g) => (g.stepType === "shift" ? sum + g.memberCount : sum),
      0,
    );

    const hasGap = groupResults.every((g) => g.stepType === "rest");

    results.push({
      date: currentDate,
      groups: groupResults,
      totalOnDuty,
      hasGap,
    });
  }

  return results;
}
