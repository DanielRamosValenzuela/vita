'use client'

import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Menu, Settings } from 'lucide-react'

import { cn } from '@/src/shared/lib/utils'

import { LanguageSelector, Logo, ThemeSelector, ThemeToggle } from '@/src/shared/ui/atoms'
import { Button } from '@/src/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/shared/ui/dropdown-menu'
import { Label } from '@/src/shared/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/shared/ui/popover'
import { Sheet, SheetContent, SheetTrigger } from '@/src/shared/ui/sheet'

import { getNavLinks } from './constants'

export function MainNavbar() {
  const { data: session, status } = useSession()
  const params = useParams()
  const locale = (params?.locale as string) || 'es'
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isLoading = status === 'loading'
  const isAuthenticated = !!session
  const navLinks = getNavLinks(t, locale)

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full border-b backdrop-blur transition-all duration-300',
      scrolled
        ? 'bg-background/95 supports-backdrop-filter:bg-background/80 shadow-sm'
        : 'bg-background/95 supports-backdrop-filter:bg-background/60'
    )}>
      <nav className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Logo locale={locale} size="sm" />
          <div className="hidden md:flex md:items-center md:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={tCommon('settings')}>
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 space-y-4">
              <div className="space-y-2">
                <Label>{tCommon('theme')}</Label>
                <ThemeSelector />
              </div>
              <div className="flex items-center justify-between">
                <Label>{tCommon('darkMode')}</Label>
                <ThemeToggle />
              </div>
              <div className="space-y-2">
                <Label>{tCommon('language')}</Label>
                <LanguageSelector />
              </div>
            </PopoverContent>
          </Popover>

          {isLoading ? (
            <div className="bg-muted h-9 w-20 animate-pulse rounded-md" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 cursor-pointer rounded-full p-0">
                  {session.user?.customImage || session.user?.image ? (
                    <div className="ring-border relative h-9 w-9 overflow-hidden rounded-full ring-2">
                      <Image
                        src={session.user.customImage || session.user.image || ''}
                        alt={session.user.name || 'Usuario'}
                        fill
                        className="rounded-full object-cover"
                        loading="eager"
                        sizes="36px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-full">
                      {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">{session.user?.name}</p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/dashboard/profile`} className="w-full cursor-pointer">
                    {t('profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href={`/${locale}/login`}>{t('login')}</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link href={`/${locale}/register`}>{t('register')}</Link>
              </Button>
            </>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t('toggleMenu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-4">
                <Logo locale={locale} size="sm" />
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-foreground text-sm font-medium transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {!isAuthenticated && (
                    <>
                      <Link
                        href={`/${locale}/login`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="hover:text-foreground text-sm font-medium transition-colors"
                      >
                        {t('login')}
                      </Link>
                      <Button asChild className="w-full">
                        <Link href={`/${locale}/register`} onClick={() => setMobileMenuOpen(false)}>
                          {t('register')}
                        </Link>
                      </Button>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
