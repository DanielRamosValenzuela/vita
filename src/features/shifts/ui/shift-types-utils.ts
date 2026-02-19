export const DEFAULT_SHIFT_TYPE_ICON = 'Clock'

export type ShiftClassification = 'DAY' | 'NIGHT' | 'MIXED'

export interface ShiftType {
  id: string
  name: string
  description?: string
  icon?: string | null
  durationMinutes: number
  classification: ShiftClassification
  color: string
  minStaffRequired: number
  idealStaffCount: number
  maxStaffAllowed: number
  isGlobal: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    shifts: number
    areaShiftTypes?: number
  }
  areaShiftTypes?: Array<{
    areaId: string
    isActive: boolean
    area: { id: string; name: string }
  }>
}

export interface AreaOption {
  id: string
  name: string
}

export interface ShiftTypeFormData {
  name: string
  description: string
  icon: string
  durationHours: string
  durationMinutes: string
  classification: ShiftClassification
  color: string
  minStaffRequired: string
  idealStaffCount: string
  maxStaffAllowed: string
  isGlobal: boolean
  isActive: boolean
  areaConfigs: Array<{ areaId: string; isActive: boolean }>
}

interface ShiftTypesState {
  isCreateDialogOpen: boolean
  editingShiftType: ShiftType | null
  deleteDialogOpen: boolean
  deleteTarget: ShiftType | null
  showSaveConfirm: boolean
  formData: ShiftTypeFormData
}

export type ShiftTypesAction =
  | { type: 'OPEN_CREATE' }
  | { type: 'OPEN_EDIT'; shiftType: ShiftType }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'OPEN_DELETE'; shiftType: ShiftType }
  | { type: 'CLOSE_DELETE' }
  | {
      type: 'UPDATE_FORM'
      field: keyof ShiftTypeFormData
      value: ShiftTypeFormData[keyof ShiftTypeFormData]
    }
  | { type: 'SET_FORM_DATA'; formData: ShiftTypeFormData }
  | { type: 'TOGGLE_SAVE_CONFIRM'; open: boolean }
  | { type: 'RESET_FORM' }

const DEFAULT_FORM_DATA: ShiftTypeFormData = {
  name: '',
  description: '',
  icon: 'Clock',
  durationHours: '8',
  durationMinutes: '0',
  classification: 'DAY',
  color: '#3b82f6',
  minStaffRequired: '1',
  idealStaffCount: '1',
  maxStaffAllowed: '10',
  isGlobal: true,
  isActive: true,
  areaConfigs: [],
}

export const INITIAL_STATE: ShiftTypesState = {
  isCreateDialogOpen: false,
  editingShiftType: null,
  deleteDialogOpen: false,
  deleteTarget: null,
  showSaveConfirm: false,
  formData: DEFAULT_FORM_DATA,
}

export const shiftTypesReducer = (
  state: ShiftTypesState,
  action: ShiftTypesAction,
): ShiftTypesState => {
  switch (action.type) {
    case 'OPEN_CREATE':
      return {
        ...state,
        isCreateDialogOpen: true,
        editingShiftType: null,
        formData: DEFAULT_FORM_DATA,
      }
    case 'OPEN_EDIT': {
      const h = Math.floor(action.shiftType.durationMinutes / 60)
      const m = action.shiftType.durationMinutes % 60
      const areaConfigs =
        action.shiftType.areaShiftTypes?.map((a) => ({
          areaId: a.areaId ?? a.area?.id ?? '',
          isActive: a.isActive ?? true,
        })) ?? []
      return {
        ...state,
        editingShiftType: action.shiftType,
        formData: {
          name: action.shiftType.name,
          description: action.shiftType.description || '',
          icon: action.shiftType.icon ?? 'Clock',
          durationHours: String(h),
          durationMinutes: String(m),
          classification: action.shiftType.classification,
          color: action.shiftType.color,
          minStaffRequired: String(action.shiftType.minStaffRequired),
          idealStaffCount: String(action.shiftType.idealStaffCount),
          maxStaffAllowed: String(action.shiftType.maxStaffAllowed),
          isGlobal: action.shiftType.isGlobal,
          isActive: action.shiftType.isActive,
          areaConfigs,
        },
      }
    }
    case 'CLOSE_DIALOG':
      return {
        ...state,
        isCreateDialogOpen: false,
        editingShiftType: null,
        formData: DEFAULT_FORM_DATA,
      }
    case 'OPEN_DELETE':
      return { ...state, deleteDialogOpen: true, deleteTarget: action.shiftType }
    case 'CLOSE_DELETE':
      return { ...state, deleteDialogOpen: false, deleteTarget: null }
    case 'UPDATE_FORM':
      return { ...state, formData: { ...state.formData, [action.field]: action.value } }
    case 'SET_FORM_DATA':
      return { ...state, formData: action.formData }
    case 'TOGGLE_SAVE_CONFIRM':
      return { ...state, showSaveConfirm: action.open }
    case 'RESET_FORM':
      return { ...state, formData: DEFAULT_FORM_DATA }
    default:
      return state
  }
}

export const PREDEFINED_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#6b7280',
  '#14b8a6',
  '#f97316',
]

export function hasShiftTypeFormChanged(
  formData: ShiftTypeFormData,
  editingShiftType: ShiftType | null,
): boolean {
  if (editingShiftType) {
    const h = Math.floor(editingShiftType.durationMinutes / 60)
    const m = editingShiftType.durationMinutes % 60
    const initialAreaConfigs =
      editingShiftType.areaShiftTypes?.map((a) => ({
        areaId: a.areaId ?? a.area?.id ?? '',
        isActive: a.isActive ?? true,
      })) ?? []

    if (formData.name.trim() !== editingShiftType.name) return true
    if ((formData.description || '') !== (editingShiftType.description || '')) return true
    if ((formData.icon ?? 'Clock') !== (editingShiftType.icon ?? 'Clock')) return true
    if (formData.durationHours !== String(h) || formData.durationMinutes !== String(m)) return true
    if (formData.classification !== editingShiftType.classification) return true
    if ((formData.color ?? '#3b82f6') !== editingShiftType.color) return true
    if (formData.minStaffRequired !== String(editingShiftType.minStaffRequired)) return true
    if (formData.idealStaffCount !== String(editingShiftType.idealStaffCount)) return true
    if (formData.maxStaffAllowed !== String(editingShiftType.maxStaffAllowed)) return true
    if (formData.isGlobal !== editingShiftType.isGlobal) return true
    if (formData.isActive !== editingShiftType.isActive) return true
    if (formData.areaConfigs.length !== initialAreaConfigs.length) return true

    const sameAreaConfigs = formData.areaConfigs.every(
      (c, i) =>
        initialAreaConfigs[i]?.areaId === c.areaId &&
        initialAreaConfigs[i]?.isActive === c.isActive,
    )
    if (!sameAreaConfigs) return true

    return false
  }

  return (
    formData.name.trim() !== '' ||
    (formData.description || '') !== '' ||
    formData.durationHours !== '8' ||
    formData.durationMinutes !== '0' ||
    formData.classification !== 'DAY' ||
    formData.color !== '#3b82f6' ||
    formData.minStaffRequired !== '1' ||
    formData.idealStaffCount !== '1' ||
    formData.maxStaffAllowed !== '10' ||
    formData.isGlobal !== true ||
    formData.isActive !== true ||
    formData.areaConfigs.length > 0
  )
}
