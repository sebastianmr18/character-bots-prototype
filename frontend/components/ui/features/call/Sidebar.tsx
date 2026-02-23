
import React from 'react';
import { ConnectionStatus } from '@/types/live.types';
import type { Character } from '@/types/chat.types';

interface SidebarProps {
  status: ConnectionStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  character?: Character | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ status, onConnect, onDisconnect, character }) => {
  const isConnecting = status === ConnectionStatus.CONNECTING;
  const isConnected = status === ConnectionStatus.CONNECTED;
  
  const characterName = character?.name || 'Character';
  const characterRole = character?.role || 'Assistant';

  return (
    <div className="md:w-1/3 bg-[#1a252f] p-8 flex flex-col items-center text-center text-white">
      <div className="mb-6 relative">
        <div className="w-32 h-32 rounded-full border-4 border-[#d4af37] overflow-hidden shadow-xl bg-stone-700 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
      </div>
      
      <h1 className="font-serif text-3xl font-bold mb-1 text-white">{characterName}</h1>
      <p className="text-stone-400 font-light italic mb-8">{characterRole}</p>
      
      <div className="flex-1 space-y-4 w-full">
        <div className="bg-white/5 p-4 rounded-xl text-left border border-white/10">
          <p className="text-xs uppercase tracking-widest text-[#d4af37] font-bold mb-1">Character</p>
          <p className="text-sm">{characterName}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl text-left border border-white/10">
          <p className="text-xs uppercase tracking-widest text-[#d4af37] font-bold mb-1">Status</p>
          <p className="text-sm">{isConnected ? 'Online & Listening' : 'Offline'}</p>
        </div>
      </div>

      <button 
        onClick={isConnected ? onDisconnect : onConnect}
        disabled={isConnecting}
        className={`mt-8 w-full py-4 rounded-full font-semibold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
          isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-[#d4af37] hover:bg-[#b8962c] text-[#1a252f]'
        }`}
      >
        {isConnected ? 'End Call' : isConnecting ? 'Connecting...' : `Call ${characterName}`}
      </button>
    </div>
  );
};
