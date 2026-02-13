export type CreateAreaInput = {
  name: string
  description?: string
  icon?: string
  color?: string
  isActive: boolean
}

export type UpdateAreaInput = {
  name?: string
  description?: string
  icon?: string
  color?: string
  isActive?: boolean
  maxConsecutiveHours?: number | null
  minRestHours?: number | null
  dayStartTime?: string | null
  dayEndTime?: string | null
}
