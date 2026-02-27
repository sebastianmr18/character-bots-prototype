
import React from 'react';

export const Visualizer: React.FC = () => {
  return (
    <div className="px-6 py-4 bg-white border-t border-stone-100 flex items-center justify-center gap-6">
      <div className="flex items-center gap-1.5 h-8">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="w-1 bg-[#d4af37] rounded-full animate-bounce" 
            style={{ 
              height: `${12 + Math.random() * 20}px`,
              animationDelay: `${i * 0.05}s`,
              animationDuration: `${0.6 + Math.random() * 0.4}s`
            }}
          />
        ))}
      </div>
      <div className="text-center">
        <p className="text-[10px] text-stone-400 font-bold tracking-[0.2em] uppercase">Voice Call Active</p>
        <p className="text-[9px] text-[#d4af37] font-medium italic">El personaje esta escuchando</p>
      </div>
      <div className="flex items-center gap-1.5 h-8">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="w-1 bg-[#d4af37] rounded-full animate-bounce" 
            style={{ 
              height: `${12 + Math.random() * 20}px`,
              animationDelay: `${i * 0.05}s`,
              animationDuration: `${0.6 + Math.random() * 0.4}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};
