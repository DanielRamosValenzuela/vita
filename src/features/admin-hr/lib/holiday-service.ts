import sampleData from '@/src/shared/lib/constants/holidays-cl-sample.json'
import type { BoostrHolidaysResponse, MappedHoliday } from '@/src/shared/lib/types/holidays'

function mapHolidays(response: BoostrHolidaysResponse): MappedHoliday[] {
  return response.data.map((holiday) => ({
    date: holiday.date,
    title: holiday.title,
    inalienable: holiday.inalienable,
    dayType: holiday.inalienable ? 'IRRENUNCIABLE' : 'HOLIDAY',
    defaultMultiplier: holiday.inalienable ? 2.5 : 1.5,
  }))
}

export async function fetchNationalHolidays(year: number): Promise<MappedHoliday[]> {
  const bffUrl = process.env.NEXT_PUBLIC_BFF_HOLIDAYS_URL

  if (bffUrl)
    try {
      const response = await fetch(`${bffUrl}?year=${year}`)
      if (response.ok) {
        const data = (await response.json()) as BoostrHolidaysResponse
        return mapHolidays(data)
      }
    } catch {}

  const sample = sampleData as BoostrHolidaysResponse
  return mapHolidays(sample).filter((h) => h.date.startsWith(String(year)))
}
