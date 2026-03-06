import { NextResponse } from 'next/server'

import { getShiftsForFeed } from '@/src/features/staff-dashboard/api/staff-shifts-actions'
import { generateICalContent } from '@/src/features/staff-dashboard/lib/ical-generator'

import { getFeedTokenByToken } from '@/src/entities/calendar-feed'

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const feedToken = await getFeedTokenByToken(token)

  if (!feedToken) {
    const emptyCalendar = generateICalContent([])
    return new NextResponse(emptyCalendar, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="vita-shifts.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  }

  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const shifts = await getShiftsForFeed(feedToken.userId, feedToken.organizationId, threeMonthsAgo)

  const icsContent = generateICalContent(
    shifts.map((s) => ({
      id: s.id,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status,
      areaName: s.area.name,
      shiftTypeName: s.shiftType.name,
      rotationName: s.rotation?.name,
      isExtra: s.isExtra,
      organizationName: s.organization?.name,
    })),
    {
      calendarName: feedToken.organizationId ? 'VITA Turnos' : 'VITA Turnos (Todas)',
    }
  )

  return new NextResponse(icsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="vita-shifts.ics"',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
