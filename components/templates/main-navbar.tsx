'use client'

import { Menu, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Logo, ThemeToggle, LanguageSelector } from '@/components/atoms'

export function MainNavbar() {
  const { data: session, status } = useSession()
  const params = useParams()
  const locale = (params?.locale as string) || 'es'
  const t = useTranslations('nav')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isLoading = status === 'loading'
  const isAuthenticated = !!session

  const navLinks = [
    { href: `/${locale}/support`, label: t('support') },
    { href: `/${locale}/contact`, label: t('contact') },
  ]

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
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
          <ThemeToggle />
          <LanguageSelector />

          {isLoading ? (
            <div className="bg-muted h-9 w-20 animate-pulse rounded-md" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
                  {session.user?.image ? (
                    <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-border">
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'Usuario'}
                        fill
                        className="object-cover"
                        sizes="36px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="bg-primary/10 ring-primary/20 flex h-9 w-9 items-center justify-center rounded-full ring-2">
                      <User className="text-primary h-5 w-5" />
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
                  <Link href={`/${locale}/profile`} className="w-full cursor-pointer">
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
                <span className="sr-only">Toggle menu</span>
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
