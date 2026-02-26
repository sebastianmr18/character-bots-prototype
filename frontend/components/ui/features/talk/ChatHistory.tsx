import React, { useEffect, useRef } from 'react';
import { Transcription } from '@/types/live.types';

interface ChatHistoryProps {
  history: Transcription[];
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ history }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-stone-400 opacity-60">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <p className="text-xl italic font-serif text-stone-600">&quot;Call Sofia to start your stay&quot;</p>
        <p className="text-xs mt-2 uppercase tracking-widest font-bold text-stone-500">The Andean Pearl • Luxury Service</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {history.map((chat, idx) => (
        <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
          <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm transition-all ${
            chat.role === 'user' 
              ? 'bg-[#1a252f] text-white rounded-tr-none' 
              : 'bg-white text-stone-800 rounded-tl-none border border-stone-200'
          }`}>
            <p className="font-bold text-[10px] uppercase tracking-tighter mb-1 opacity-50">
              {chat.role === 'user' ? 'Guest' : 'Sofia'}
            </p>
            {chat.text}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};
