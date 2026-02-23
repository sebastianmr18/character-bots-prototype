'use client'
/**
 * 
 * unused
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import type { Conversation } from '@/types/chat.types'

interface CharacterCardProps {
  conversation: Conversation
  onClick: () => void
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ conversation, onClick }) => {
  const { character, createdAt } = conversation
  
  const initials = character.name
    .split(' ')
    .map((n: any) => n[0])
    .join('')
    .toUpperCase()

  // Formatear fecha
  const date = new Date(createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  const time = new Date(createdAt).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex justify-between items-center text-xs text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-2">
            <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{date}</span>
            </div>
            <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{time}</span>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
            {initials}
            </div>
            <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                    {character.name}
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {character.role}
                </p>
            </div>
        </div>

        <div className="flex-1 mt-2">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 italic bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
             `&quot;`{character.biography}`&quot;`
          </p>
        </div>

        <Button
          onClick={onClick}
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
        >
          Continuar Chat
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}