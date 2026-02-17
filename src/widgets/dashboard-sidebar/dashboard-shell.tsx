'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Menu } from 'lucide-react'

import { Button } from '@/src/shared/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/src/shared/ui/sheet'

import { usePathname } from '@/i18n/navigation'

import { DashboardSidebar } from './index'
import type { DashboardSidebarProps } from './types'

interface DashboardShellProps extends DashboardSidebarProps {
  children: React.ReactNode
}

export function DashboardShell({ user, children, unreadNotificationCount }: DashboardShellProps) {
  const t = useTranslations('common')
  const tNav = useTranslations('nav')
  const tDashboard = useTranslations('dashboard')
  const [sheetOpen, setSheetOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setSheetOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden">
      <header
        className="bg-card border-border fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-2 border-b px-4 lg:hidden"
        aria-label={tNav('toggleMenu')}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setSheetOpen(true)}
          aria-label={tNav('toggleMenu')}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <span className="text-primary font-semibold">{t('appName')}</span>
      </header>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="left"
          className="w-72 border-r p-0"
          aria-describedby="dashboard-menu-description"
        >
          <SheetTitle className="sr-only">{tNav('toggleMenu')}</SheetTitle>
          <SheetDescription id="dashboard-menu-description" className="sr-only">
            {tDashboard('sidebarLabel')}
          </SheetDescription>
          <DashboardSidebar user={user} className="h-full w-full border-0" unreadNotificationCount={unreadNotificationCount} />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block">
        <DashboardSidebar user={user} unreadNotificationCount={unreadNotificationCount} />
      </div>

      <main className="bg-background flex-1 overflow-y-auto pt-14 lg:pt-0">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
