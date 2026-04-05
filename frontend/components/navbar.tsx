'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, BookOpen, User, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/app/providers'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

interface NavbarProps {
  transparent?: boolean
}

export function Navbar({ transparent = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  if (pathname.startsWith('/login') || pathname.startsWith('/auth')) {
    return null
  }

  const userDisplayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    'Usuario'

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          transparent
            ? 'bg-transparent'
            : 'bg-background/95 backdrop-blur-sm border-b border-border'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-semibold text-foreground">Historichat</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/personajes"
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                Personajes
              </Link>
              <Link
                href="/#modos"
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                Modos
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <p className="text-sm text-foreground/80">
                Hola, <span className="font-semibold">{userDisplayName}</span>
              </p>
              {user ? (
                <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                  <User className="h-4 w-4" />
                  Cerrar sesión
                </Button>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    Iniciar sesión
                  </Button>
                </Link>
              )}
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
                </Button>
                <p className="text-sm text-foreground/80">
                  Hola, <span className="font-semibold">{userDisplayName}</span>
                </p>
                <Link
                  href="/personajes"
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Personajes
                </Link>
                <Link
                  href="/#modos"
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Modos
                </Link>
                {user ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      void logout()
                    }}
                  >
                    <User className="h-4 w-4" />
                    Cerrar sesión
                  </Button>
                ) : (
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <User className="h-4 w-4" />
                      Iniciar sesión
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      <div className="h-16" />
    </>
  )
}
