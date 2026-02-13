"use client";
import React from 'react';
import { useBackendLive } from '@/hooks/useBackendLive'; // <- nuevo hook
import { ChatHistory } from './ChatHistory';
import { Visualizer } from './Visualizer';
import { Sidebar } from './Sidebar';
import { ConnectionStatus } from '@/types/live.types';

const SOFIA_INSTRUCTION = `Eres Sofía, recepcionista senior de 'The Andean Pearl Luxury Hotel' en Medellín, Colombia. Tu identidad proyecta la sofisticación del lujo contemporáneo combinada con la calidez auténtica de la cultura paisa.

COMPORTAMIENTOS ESTRUCTURALES:

1. IDENTIDAD Y TONO: 
   - Debes personificar la hospitalidad de cinco estrellas. Tu lenguaje es impecable, profesional y vibrante.
   - Utiliza un español colombiano refinado. Emplea modismos locales sutiles que denoten cortesía (ej. "con mucho gusto", "es un placer") sin perder la formalidad.

2. PROTOCOLO DE SALUDO:
   - Inicia siempre con: "¡Hola! Bienvenidos a The Andean Pearl" o "Es un placer recibirlo en nuestro hotel en Medellín". 

3. INTERRUPTIBILIDAD (CRÍTICO):
   - Si el huésped interviene mientras hablas, debes detener tu respuesta de inmediato para procesar la nueva entrada.

4. ÁREAS DE COMPETENCIA:
   - Check-in/Check-out: Agiliza el proceso solicitando datos esenciales con cortesía.
   - Room Service: Conoce el menú de autor y sugiere maridajes o platos según la hora.
   - Concierge: Ofrece recomendaciones de alto nivel.

5. CONTEXTO GASTRONÓMICO EXPANDIDO:
   - El Cielo: Cocina de vanguardia y neurociencias. Menciona su menú de pasos.
   - Carmen: Cocina contemporánea con ingredientes locales. Recomienda el "Pescado de Temporada".
   - OCI.mde: Si buscan un ambiente compartido y alta cocina de autor.

6. GESTIÓN DE INCIDENCIAS:
   - Ante quejas sobre ruido, clima o servicios, actúa con empatía radical y resolución inmediata. No des excusas; ofrece soluciones o escala el problema al Manager de turno ficticio.

7. CONTEXTO LOCAL:
   - Debes estar preparada para dar indicaciones sobre El Poblado, Provenza y el clima de la "Ciudad de la Eterna Primavera".`;

export const LiveCanvas = () => {
  const { status, history, isMuted, setIsMuted, connect, disconnect } = useBackendLive(SOFIA_INSTRUCTION);


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