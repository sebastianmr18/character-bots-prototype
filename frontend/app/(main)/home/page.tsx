'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, MessageCircle, Zap } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-between">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">Nombre por confirmar</span>
        </div>
        {/* TO DO: Esto deberia redirigir a un inicio de sesión antes del chat */}
        <Button 
          variant="ghost"
          onClick={() => router.push('/chats')}
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          Chatea ya!
        </Button>
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
            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Chat Natural</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Conversaciones fluidas y contextuales con IA</p>
            </div>
            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Respuestas Rápidas</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Obtén respuestas instantáneas y precisas</p>
            </div>
            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Audio & Voz</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Interactúa con reconocimiento de voz</p>
            </div>
          </div>

          {/* CTA Button 
          TO DO: Esto deberia redirigir a un inicio de sesión antes del chat
          */}
          <Button
            size="lg"
            onClick={() => router.push('/chats')}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-6 text-lg font-semibold rounded-xl flex items-center gap-2 mx-auto"
          >
            Chatea ya!
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button
            size="lg"
            onClick={() => router.push('/talk')}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-6 text-lg font-semibold rounded-xl flex items-center gap-2 mx-auto"
          >
            Conversa ya!
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Prototipo con RAG y ElevenLabs • Respuestas con audio incluido • En desarrollo!
        </p>
      </footer>
    </main>
  )
}
