interface AreaShapeForState {
  name: string
  description: string | null
  icon: string | null
  color: string
  isActive: boolean
  maxConsecutiveHours?: number | null
  minRestHours?: number | null
  dayStartTime?: string | null
  dayEndTime?: string | null
  shiftTypes: Array<{
    isActive: boolean
    shiftType: { id: string }
  }>
}

export interface AreaFormState {
  name: string
  description: string
  icon: string
  color: string
  isActive: boolean
  maxConsecutiveHours: string
  minRestHours: string
  dayStartTime: string
  dayEndTime: string
  selectedShiftTypeIds: Set<string>
  selectedChiefIds: Set<string>
  selectedStaffIds: Set<string>
  showSaveConfirm: boolean
}

export type SimpleFieldKey = Exclude<
  keyof AreaFormState,
  'selectedShiftTypeIds' | 'selectedChiefIds' | 'selectedStaffIds'
>

export type AreaFormAction =
  | { type: 'SET_FIELD'; field: SimpleFieldKey; value: string | boolean }
  | { type: 'SET_SHIFT_TYPES'; value: Set<string> }
  | { type: 'SET_CHIEFS'; value: Set<string> }
  | { type: 'SET_STAFF'; value: Set<string> }
  | { type: 'TOGGLE_SAVE_CONFIRM'; value: boolean }

export const areaFormReducer = (state: AreaFormState, action: AreaFormAction): AreaFormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value } as AreaFormState
    case 'SET_SHIFT_TYPES':
      return { ...state, selectedShiftTypeIds: action.value }
    case 'SET_CHIEFS':
      return { ...state, selectedChiefIds: action.value }
    case 'SET_STAFF':
      return { ...state, selectedStaffIds: action.value }
    case 'TOGGLE_SAVE_CONFIRM':
      return { ...state, showSaveConfirm: action.value }
    default:
      return state
  }
}

export const createInitialState = (
  area: AreaShapeForState,
  initialAssignedChiefIds: Set<string>,
  initialAssignedStaffIds: Set<string>
): AreaFormState => ({
  name: area.name,
  description: area.description || '',
  icon: area.icon ?? 'Building2',
  color: area.color ?? '#3b82f6',
  isActive: area.isActive,
  maxConsecutiveHours: area.maxConsecutiveHours != null ? String(area.maxConsecutiveHours) : '',
  minRestHours: area.minRestHours != null ? String(area.minRestHours) : '',
  dayStartTime: area.dayStartTime ?? '',
  dayEndTime: area.dayEndTime ?? '',
  selectedShiftTypeIds: new Set(
    area.shiftTypes.filter((ast) => ast.isActive).map((ast) => ast.shiftType.id)
  ),
  selectedChiefIds: new Set(initialAssignedChiefIds),
  selectedStaffIds: new Set(initialAssignedStaffIds),
  showSaveConfirm: false,
})

export const hasAreaFormChanged = (
  state: AreaFormState,
  area: AreaShapeForState,
  initialSelectedIds: Set<string>,
  canAssignChiefs: boolean,
  initialAssignedChiefIds: Set<string>,
  initialAssignedStaffIds: Set<string>
): boolean => {
  if (state.name.trim() !== area.name) return true
  if ((state.description || '') !== (area.description || '')) return true
  if ((state.icon ?? 'Building2') !== (area.icon ?? 'Building2')) return true
  if ((state.color ?? '#3b82f6') !== (area.color ?? '#3b82f6')) return true
  if (state.isActive !== area.isActive) return true
  const maxStr = area.maxConsecutiveHours != null ? String(area.maxConsecutiveHours) : ''
  if (state.maxConsecutiveHours !== maxStr) return true
  const minStr = area.minRestHours != null ? String(area.minRestHours) : ''
  if (state.minRestHours !== minStr) return true
  if ((area.dayStartTime ?? '') !== state.dayStartTime) return true
  if ((area.dayEndTime ?? '') !== state.dayEndTime) return true
  if (state.selectedShiftTypeIds.size !== initialSelectedIds.size) return true
  if ([...state.selectedShiftTypeIds].some((id) => !initialSelectedIds.has(id))) return true
  if ([...initialSelectedIds].some((id) => !state.selectedShiftTypeIds.has(id))) return true
  if (canAssignChiefs) {
    if (state.selectedChiefIds.size !== initialAssignedChiefIds.size) return true
    if ([...state.selectedChiefIds].some((id) => !initialAssignedChiefIds.has(id))) return true
    if ([...initialAssignedChiefIds].some((id) => !state.selectedChiefIds.has(id))) return true
  }
  if (state.selectedStaffIds.size !== initialAssignedStaffIds.size) return true
  if ([...state.selectedStaffIds].some((id) => !initialAssignedStaffIds.has(id))) return true
  if ([...initialAssignedStaffIds].some((id) => !state.selectedStaffIds.has(id))) return true
  return false
}
