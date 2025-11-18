'use client'

import type React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Character } from '@/types/chat.types'
import { ArrowRight } from 'lucide-react'

interface CharacterCardProps {
  character: Character
  onClick: () => void
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, onClick }) => {
  const initials = character.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
      <div className="p-6 flex flex-col gap-4 flex-1">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl mx-auto">
          {initials}
        </div>

        {/* Content */}
        <div className="text-center flex-1">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
            {character.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {character.description || 'Personaje IA interactivo'}
          </p>
        </div>

        {/* Button */}
        <Button
          onClick={onClick}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
        >
          Conversar
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
