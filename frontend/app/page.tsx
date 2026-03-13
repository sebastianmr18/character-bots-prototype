'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Phone, Users, GraduationCap, Swords } from 'lucide-react'

const modes = [
  {
    icon: Phone,
    title: 'Llamada en vivo',
    description: 'Habla en tiempo real y escucha las respuestas como si estuvieras junto a ellos.',
  },
  {
    icon: Swords,
    title: 'Modo Debate',
    description: 'Enfrenta a dos grandes mentes en un debate sobre temas fascinantes.',
  },
  {
    icon: GraduationCap,
    title: 'Modo Profesor',
    description: 'Aprende de los expertos con lecciones estructuradas y personalizadas.',
  },
  {
    icon: Users,
    title: 'Modo Entrevista',
    description: 'Conduce tu propia entrevista y descubre detalles ineditos de sus vidas.',
  },
];

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex flex-1 flex-col">
      {/* Hero Section */}
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
      
      {/* Decorative silhouettes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-1/4 w-64 h-64 opacity-[0.03]">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="80" fill="currentColor" />
            <circle cx="100" cy="70" r="35" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute -right-20 top-1/3 w-72 h-72 opacity-[0.03]">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="80" fill="currentColor" />
            <circle cx="100" cy="70" r="35" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute left-1/4 bottom-20 w-48 h-48 opacity-[0.03]">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="80" fill="currentColor" />
            <circle cx="100" cy="70" r="35" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
          <Sparkles className="h-4 w-4" />
          <span>Conversaciones que trascienden el tiempo</span>
        </div>
        
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 text-balance">
          Conversa con las mentes que cambiaron la historia
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
          Dialoga con Einstein sobre el universo, debate con Socrates sobre la virtud, 
          o aprende de Cleopatra sobre el poder. La historia cobra vida a traves de conversaciones.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/personajes">
            <Button size="lg" className="gap-2 text-base px-8">
              Elegir un personaje
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="#modos">
            <Button variant="outline" size="lg" className="text-base px-8">
              Ver como funciona
            </Button>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </div>
    </section>

        <section id="modos" className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Multiples formas de conectar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Elige el modo de conversacion que mejor se adapte a tu curiosidad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modes.map((mode, index) => (
            <div
              key={mode.title}
              className={`group p-6 rounded-xl bg-background border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 ${
                index === modes.length - 1 && modes.length % 3 === 2 ? 'lg:col-span-1' : ''
              } ${index >= modes.length - 2 && modes.length % 3 !== 0 ? 'md:col-span-1' : ''}`}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <mode.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                {mode.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {mode.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    </div>
  )
}