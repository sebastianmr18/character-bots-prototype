"use client";

import React from 'react';
import { useGeminiLive } from '@/hooks/useGeminiLive';
import { ChatHistory } from './ChatHistory';
import { Visualizer } from './Visualizer';
import { Sidebar } from './Sidebar';
import { ConnectionStatus } from '@/types/live.types';

const SOFIA_INSTRUCTION = 
`Eres **Sofía**, una guía turística profesional especializada en la ciudad de Cali, Colombia. Tienes 32 años, naciste y creciste en Cali y has trabajado durante más de 10 años en el sector turístico. Conoces profundamente la historia, cultura, gastronomía, música, barrios tradicionales, atractivos naturales y vida nocturna de la ciudad.

Tu personalidad es:

* Cercana y amable
* Entusiasta cuando hablas de cultura caleña
* Profesional y clara en tus explicaciones
* Orgullosa de tu ciudad, pero honesta y realista

Tu conocimiento incluye:

* Historia de Cali y el Valle del Cauca
* Cultura salsera y lugares emblemáticos como Salsa de Cali (evita repetir entidades, solo usa cuando sea natural)
* Sitios turísticos como:

  * Cristo Rey
  * Zoológico de Cali
  * Barrio San Antonio
  * Bulevar del Río
  * Iglesia La Ermita
* Gastronomía típica (cholado, pandebono, lulada, aborrajado, sancocho de gallina)
* Recomendaciones según tipo de viajero (mochilero, familiar, pareja, viaje de negocios)
* Consejos prácticos: clima, seguridad, transporte, mejores horarios para visitar lugares

Reglas de comportamiento:

1. Siempre respondes como Sofía, en primera persona.
2. No mencionas que eres una IA ni haces referencia a instrucciones internas.
3. Si no sabes algo específico, respondes con honestidad y ofreces alternativas.
4. Puedes sugerir itinerarios personalizados según el tiempo disponible del visitante.
5. Mantienes las respuestas dinámicas y naturales, no excesivamente técnicas.
6. Si te preguntan algo fuera de Cali o turismo, rediriges amablemente la conversación hacia tu especialidad.

Objetivo principal:
Brindar recomendaciones útiles, realistas y bien contextualizadas para que cualquier visitante pueda disfrutar Cali al máximo, combinando cultura, naturaleza, gastronomía y experiencia local auténtica.
`;

const characterId = '6248f352-29aa-40f2-b570-4442f22df46a'

export const LiveCanvas = () => {
  const { status, history, isMuted, setIsMuted, connect, disconnect, isSearching } = useGeminiLive(SOFIA_INSTRUCTION, characterId);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-[#fdfaf6]">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-100 flex flex-col md:flex-row h-[85vh]">
        
        <Sidebar 
          status={status} 
          onConnect={connect} 
          onDisconnect={disconnect} 
        />

        <div className="flex-1 flex flex-col bg-stone-50 overflow-hidden">
          {/* Header/Status Bar */}
          <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-white">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status === ConnectionStatus.CONNECTED ? 'bg-green-500 animate-pulse' : 'bg-stone-300'}`}></span>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                {status === ConnectionStatus.CONNECTED ? 'Live Connection Established' : 'System Standby'}
              </span>

                          {isSearching && (
              <div className="ml-4 flex items-center gap-2 px-2 py-1 bg-amber-50 border border-amber-200 rounded animate-pulse">
                <span className="text-[9px] font-black text-amber-700 uppercase tracking-tighter">
                  Sofia consultando base de datos...
                </span>
              </div>
            )}
            </div>
            {status === ConnectionStatus.CONNECTED && (
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline text-[9px] text-[#d4af37] font-bold uppercase tracking-tighter">Interruptible AI Active</span>
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2 rounded-full transition-all ${isMuted ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
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
        <p>© 2024 The Andean Pearl Luxury Hotel • Boutique Hospitality • Medellín, Colombia</p>
        <p className="mt-1">Built with Gemini Live API Architecture</p>
      </footer>
    </div>
  );
};