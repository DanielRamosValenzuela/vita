export interface BoostrHoliday {
  date: string
  title: string
  type: string
  inalienable: boolean
  extra: string
}

export interface BoostrHolidaysResponse {
  status: string
  data: BoostrHoliday[]
}

export interface MappedHoliday {
  date: string
  title: string
  inalienable: boolean
  dayType: 'HOLIDAY' | 'IRRENUNCIABLE'
  defaultMultiplier: number
}
