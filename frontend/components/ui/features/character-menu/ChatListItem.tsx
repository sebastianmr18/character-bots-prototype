'use client'

import type React from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Clock, ArrowRight } from 'lucide-react'
import type { Conversation } from '@/types/chat.types' // Asume el tipo Conversation
import { useEffect } from 'react'

interface ChatListItemProps {
  conversation: Conversation
  onClick: (conversationId: string) => void
}

export const ChatListItem: React.FC<ChatListItemProps> = ({ conversation, onClick }) => {
  const lastMessage = conversation.messages.length > 0 
    ? conversation.messages[conversation.messages.length - 1] 
    : null;

  const createdAtDate = new Date(conversation.createdAt);
  const dateString = createdAtDate.toLocaleDateString();
  const timeString = createdAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    useEffect(() => {
    console.log(conversation);
  }, [conversation]);

  return (
    <div 
      key={conversation.id} 
      onClick={() => onClick(conversation.id)}
      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all duration-200 
                 hover:bg-gray-50 dark:hover:bg-gray-700/70 shadow-sm hover:shadow-md flex justify-between items-center"
    >
      <div className='flex-1 min-w-0'>
        {/* Título y fecha */}
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 truncate">
          <MessageSquare className='w-4 h-4'/> 
          Conversación del {dateString}
        </p>

        {/* Último Mensaje */}
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1 max-w-lg">
          {lastMessage ? (
            `Último mensaje: "${lastMessage.content}"`
          ) : (
            'Aún no hay mensajes.'
          )}
        </div>
      </div>
      
      {/* Hora y botón de acceso */}
      <div className='flex items-center gap-2 flex-shrink-0 ml-4'>
        <span className='text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1'>
          <Clock className='w-3 h-3'/> {timeString}
        </span>
        <ArrowRight className='w-4 h-4 text-gray-400 dark:text-gray-500'/>
      </div>
    </div>
  )
}