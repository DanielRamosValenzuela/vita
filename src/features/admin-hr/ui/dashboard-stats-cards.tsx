'use client'

import { Calendar, Clock, DollarSign, LayoutGrid, Users } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'

import type { AdminHRDashboardStats } from '../lib'

interface DashboardStatsCardsProps {
  stats: AdminHRDashboardStats
}

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  const cards = [
    {
      title: 'Áreas',
      value: stats.totalAreas,
      icon: LayoutGrid,
      description: 'Áreas activas',
    },
    {
      title: 'Tipos de Turno',
      value: stats.totalShiftTypes,
      icon: Clock,
      description: 'Tipos configurados',
    },
    {
      title: 'Personal',
      value: stats.totalStaff,
      icon: Users,
      description: 'Personal activo',
    },
    {
      title: 'Tarifas',
      value: stats.totalRates,
      icon: DollarSign,
      description: 'Tarifas configuradas',
    },
    {
      title: 'Turnos Activos',
      value: stats.activeShifts,
      icon: Calendar,
      description: 'Este mes',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-muted-foreground text-xs">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
