"use client";

import React from 'react';
import { useGeminiLive } from '@/hooks/useGeminiLive';
import { useCharacterById } from '@/hooks/useCharacterById';
import { ChatHistory } from './ChatHistory';
import { Visualizer } from './Visualizer';
import { Sidebar } from './Sidebar';
import { ConnectionStatus } from '@/types/live.types';

interface CallCanvasProps {
  characterId: string;
}

export const CallCanvas: React.FC<CallCanvasProps> = ({ characterId }) => {
  const { character, isLoading } = useCharacterById(characterId);
  
  // Generar instrucción dinámica basada en el personaje
  const generateInstruction = (char: typeof character): string => {
    if (!char) return '';
    
    return `Eres ${char.name}. ${char.description}

INFORMACIÓN SOBRE TI:
- Nombre: ${char.name}
- Rol: ${char.role}
- Biografía: ${char.biography}

Comportamiento:
- Mantén coherencia con tu personaje descrito arriba
- Sé amable pero auténtico en tu rol
- Si te piden información sobre ti, usa los detalles proporcionados
- Intenta ser conversacional y natural`;
  };

  const { status, history, isMuted, setIsMuted, connect, disconnect, isSearching } = useGeminiLive(
    generateInstruction(character),
    characterId
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#fdfaf6]">
        <div className="text-center">
          <p className="text-gray-600">Cargando información del personaje...</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#fdfaf6]">
        <div className="text-center">
          <p className="text-red-600">Error al cargar el personaje</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-[#fdfaf6]">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-100 flex flex-col md:flex-row h-[85vh]">
        
        <Sidebar 
          status={status} 
          onConnect={connect} 
          onDisconnect={disconnect}
          character={character}
        />

        <div className="flex-1 flex flex-col bg-stone-50 overflow-hidden">
          {/* Header/Status Bar */}
          <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-white">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-stone-900">{character.name}</h2>
              <p className="text-xs text-stone-500">{character.role}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-2 h-2 rounded-full ${status === ConnectionStatus.CONNECTED ? 'bg-green-500 animate-pulse' : 'bg-stone-300'}`}></span>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                  {status === ConnectionStatus.CONNECTED ? 'Live Connection Established' : 'System Standby'}
                </span>

                {isSearching && (
                  <div className="ml-4 flex items-center gap-2 px-2 py-1 bg-amber-50 border border-amber-200 rounded animate-pulse">
                    <span className="text-[9px] font-black text-amber-700 uppercase tracking-tighter">
                      {character.name} consultando...
                    </span>
                  </div>
                )}
              </div>
            </div>
            {status === ConnectionStatus.CONNECTED && (
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline text-[9px] text-[#d4af37] font-bold uppercase tracking-tighter">Interruptible AI Active</span>
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2 rounded-full transition-all ${isMuted ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3-3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3-3z" /></svg>
                  )}
                </button>
              </div>
            )}
          </div>

          <ChatHistory history={history} />

          {status === ConnectionStatus.CONNECTED && <Visualizer />}
        </div>
      </div>

      <footer className="mt-8 text-stone-400 text-[10px] text-center max-w-lg leading-relaxed uppercase tracking-widest opacity-80">
        <p>Prototipo</p>
        <p className="mt-1">Hecho con Gemini Live API Architecture</p>
      </footer>
    </div>
  );
};
