"use client";

import React from 'react';
import { useLiveConversation } from '@/hooks/useLiveConversation';

export const LiveCanvas = () => {
  const { isConnected, transcript, connect, disconnect } = useLiveConversation(process.env.NEXT_PUBLIC_API_URL!);

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h2 className="text-xl font-bold mb-4">Conversación en Tiempo Real</h2>
      
      <div className="min-h-[100px] p-4 bg-muted mb-4 rounded">
        {transcript || "Esperando respuesta..."}
      </div>

      <button
        onClick={isConnected ? disconnect : connect}
        className={`px-4 py-2 rounded font-bold ${isConnected ? 'bg-red-500' : 'bg-green-500'} text-white`}
      >
        {isConnected ? 'Finalizar Llamada' : 'Iniciar Conversación'}
      </button>

      {isConnected && (
        <span className="ml-4 animate-pulse text-green-400">● Live</span>
      )}
    </div>
  );
};