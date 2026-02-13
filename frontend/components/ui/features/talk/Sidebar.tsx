
import React from 'react';
import { ConnectionStatus } from '@/types/live.types';

interface SidebarProps {
  status: ConnectionStatus;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ status, onConnect, onDisconnect }) => {
  const isConnecting = status === ConnectionStatus.CONNECTING;
  const isConnected = status === ConnectionStatus.CONNECTED;

  return (
    <div className="md:w-1/3 bg-[#1a252f] p-8 flex flex-col items-center text-center text-white">
      <div className="mb-6 relative">
        <div className="w-32 h-32 rounded-full border-4 border-[#d4af37] overflow-hidden shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300" 
            alt="Sofia - Receptionist" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
      </div>
      
      <h1 className="font-serif text-3xl font-bold mb-1 text-white">Sofia</h1>
      <p className="text-stone-400 font-light italic mb-8">Concierge & Front Desk</p>
      
      <div className="flex-1 space-y-4 w-full">
        <div className="bg-white/5 p-4 rounded-xl text-left border border-white/10">
          <p className="text-xs uppercase tracking-widest text-[#d4af37] font-bold mb-1">Location</p>
          <p className="text-sm">Medellín, Colombia</p>
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
        {isConnected ? 'End Call' : isConnecting ? 'Connecting...' : 'Call Sofia'}
      </button>
    </div>
  );
};
