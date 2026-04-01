import type React from "react"

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-1" aria-label="Escribiendo" role="status">
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70 animate-[typing-pulse_1s_ease-in-out_infinite]" />
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70 animate-[typing-pulse_1s_ease-in-out_0.15s_infinite]" />
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70 animate-[typing-pulse_1s_ease-in-out_0.3s_infinite]" />
      <style jsx>{`
        @keyframes typing-pulse {
          0%,
          80%,
          100% {
            transform: scale(0.8);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
