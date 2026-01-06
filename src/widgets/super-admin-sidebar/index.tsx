'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Building2, LayoutDashboard, CreditCard, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/src/shared/lib/utils'
import { ThemeToggle } from '@/src/shared/ui/atoms/theme-toggle'
import { LanguageSelector } from '@/src/shared/ui/atoms/language-selector'
import { Button } from '@/src/shared/ui/button'
import { signOut } from 'next-auth/react'
import type { CurrentUser } from '@/types/currentUser'

interface SuperAdminSidebarProps {
  user: CurrentUser
  locale: string
}

export function SuperAdminSidebar({ user, locale }: SuperAdminSidebarProps) {
  const t = useTranslations('superAdmin.sidebar')
  const tCommon = useTranslations('common')
  const pathname = usePathname()

  const navigation = [
    {
      name: t('dashboard'),
      href: `/${locale}/super-admin`,
      icon: LayoutDashboard,
    },
    {
      name: t('organizations'),
      href: `/${locale}/super-admin/organizations`,
      icon: Building2,
    },
    {
      name: t('payments'),
      href: `/${locale}/super-admin/payments`,
      icon: CreditCard,
    },
    {
      name: t('analytics'),
      href: `/${locale}/super-admin/analytics`,
      icon: BarChart3,
    },
    {
      name: t('settings'),
      href: `/${locale}/super-admin/settings`,
      icon: Settings,
    },
  ]

  const handleLogout = async () => {
    await signOut({ callbackUrl: `/${locale}/login` })
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <Link href={`/${locale}`} className="border-b p-6 transition-opacity hover:opacity-80">
        <h2 className="text-xl font-bold text-primary">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('role')}</p>
      </Link>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-4 border-t p-4">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSelector />
        </div>
        
        <div className="flex items-center gap-3 rounded-lg bg-accent p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full"
        >
          {tCommon('logout')}
        </Button>
      </div>
    </div>
  )
}

