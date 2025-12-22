'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Calendar } from 'lucide-react'
import type { CurrentUser } from '@/types'

interface CalendarViewProps {
  user: CurrentUser | null
}

export function CalendarView({ user }: CalendarViewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="text-primary h-5 w-5" />
          <CardTitle>Calendario de Turnos</CardTitle>
        </div>
        <CardDescription>
          {user
            ? 'Aquí verás todos tus turnos asignados'
            : 'Inicia sesión para ver y gestionar tus turnos'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed">
          <div className="text-center">
            <Calendar className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-lg font-medium">Calendario en desarrollo</p>
            <p className="text-muted-foreground mt-2 text-sm">
              El componente de calendario se implementará próximamente
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
