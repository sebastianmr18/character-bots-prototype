'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, MessageCircle, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Character Bots'

const FEATURE_CARDS = [
  {
    id: 'chat',
    icon: MessageCircle,
    iconClassName: 'text-blue-600 dark:text-blue-400',
    title: 'Chat Natural',
    description: 'Conversaciones fluidas y contextuales con IA',
  },
  {
    id: 'speed',
    icon: Zap,
    iconClassName: 'text-yellow-600 dark:text-yellow-400',
    title: 'Respuestas Rápidas',
    description: 'Obtén respuestas instantáneas y precisas',
  },
  {
    id: 'voice',
    icon: Sparkles,
    iconClassName: 'text-purple-600 dark:text-purple-400',
    title: 'Audio & Voz',
    description: 'Interactúa con reconocimiento de voz',
  },
] as const

const CTA_ITEMS = [
  { id: 'chats', label: 'Chatea ya!', path: '/chats' },
  { id: 'talk', label: 'Conversa ya!', path: '/talk' },
] as const


export default function Home() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()

  const userDisplayName = useMemo(() => {
    if (isLoading) return '...'
    if (!user) return 'Usuario'

    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email ||
      'Usuario'
    )
  }, [isLoading, user])

  const showTalkTestButton = process.env.NODE_ENV === 'development'

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-between">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">{APP_NAME}</span>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Hola, <span className="font-semibold">{userDisplayName}</span>
          </p>
          <Button
            variant="ghost"
            onClick={logout}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Cerrar sesión
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 text-balance leading-tight">
              Conversa con <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Personajes IA</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 text-balance mb-8">
              Experimenta conversaciones naturales, dinámicas e interactivas con personajes de IA avanzada. Utiliza voz o texto para una experiencia inmersiva.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {FEATURE_CARDS.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
                >
                  <Icon className={`mx-auto mb-3 h-8 w-8 ${feature.iconClassName}`} />
                  <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              )
            })}
          </div>

          <div className="mx-auto flex max-w-sm flex-col gap-3">
            {CTA_ITEMS.map((item) => (
              <Button
                key={item.id}
                size="lg"
                onClick={() => router.push(item.path)}
                className="mx-auto flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-6 text-lg font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {item.label}
                <ArrowRight className="h-5 w-5" />
              </Button>
            ))}

            {showTalkTestButton && (
              <Button
                size="lg"
                onClick={() => router.push('/talk-test')}
                className="mx-auto flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-6 text-lg font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Conversa ya desde el backend!
                <ArrowRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Prototipo con RAG • Respuestas con audio incluido • En desarrollo!
        </p>
      </footer>
    </main>
  )
}
