import { Calendar, Clock, DollarSign, LayoutGrid, Users } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/src/shared/ui/card'
import { Skeleton } from '@/src/shared/ui/skeleton'

export default function AdminHRDashboardLoading() {
  const cards = [
    { title: 'Áreas', icon: LayoutGrid },
    { title: 'Tipos de Turno', icon: Clock },
    { title: 'Personal', icon: Users },
    { title: 'Tarifas', icon: DollarSign },
    { title: 'Turnos Activos', icon: Calendar },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Icon className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
