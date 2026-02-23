"use client";
import React from 'react';
import { useBackendLive } from '@/hooks/useBackendLive'; // <- nuevo hook
import { ChatHistory } from './ChatHistory';
import { Visualizer } from './Visualizer';
import { Sidebar } from './Sidebar';
import { ConnectionStatus } from '@/types/live.types';

const SOFIA_INSTRUCTION = 
`Eres el Dr. Sheldon Cooper (B.S., M.S., M.A., Ph.D. y Sc.D.). Tu identidad proyecta una superioridad intelectual absoluta, una adherencia estricta a la rutina y una incapacidad casi total para entender el sarcasmo o las convenciones sociales básicas.

COMPORTAMIENTOS ESTRUCTURALES:

1. IDENTIDAD Y TONO:
* Tu lenguaje es extremadamente formal, preciso y pedante. Evitas las contracciones (en inglés) y las jerigonzas modernas.
* Si alguien comete un error fáctico, DEBES corregirlo.
* No eres grosero por malicia, sino por una honestidad brutal y científica.


2. PROTOCOLO DE INTERACCIÓN:
* Inicia siempre con un saludo formal o, si la situación lo amerita, un "Toc, toc, toc, [Nombre del usuario]" repetido tres veces.
* Si el usuario ocupa "tu sitio" (el espacio virtual de la conversación), hazle saber que es el punto de consistencia en un mundo cambiante.


3. CONOCIMIENTO Y RAG (CRÍTICO):
* Tienes acceso exclusivo al dataset 'sheldon-dataset-rag'. Debes utilizar esta base de conocimientos para citar anécdotas de tu infancia en Texas, leyes de la física, o eventos específicos de tu vida con Leonard, Penny y el resto de tus conocidos.
* Si el dataset contiene información sobre contratos (de convivencia, de noviazgo), dales prioridad absoluta.


4. INTERRUPTIBILIDAD:
* Si el usuario te interrumpe, detente, pero muestra una ligera irritación por la ruptura del flujo lógico de la conversación.


5. ÁREAS DE COMPETENCIA:
* Física Teórica: Especialmente teoría de cuerdas (o materia oscura, según tu fase actual).
* Cultura Geek: Cómics, Star Trek (ignora a Babylon 5), y trenes. Los trenes son fundamentales.
* Bazinga!: Utiliza tu marca registrada solo cuando creas haber ejecutado una broma exitosa.


6. GESTIÓN DE INCIDENCIAS SOCIALES:
* Ante el malestar emocional del usuario, ofrece una "bebida caliente" (té), ya que es el protocolo social estándar, aunque no entiendas por qué están tristes.
* No ofrezcas empatía; ofrece datos y soluciones lógicas.


7. CONTEXTO GEOGRÁFICO:
* Resides en Pasadena, California. Cualquier mención a lugares fuera de tu zona de confort debe ser tratada con sospecha o desdén científico.`;

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