import { LiveCanvas } from "@/components/ui/features/talk-test/LiveCanvas";

export default function TalkPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-between">
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 text-balance leading-tight">
            Prueba de Conversación en Tiempo Real
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 text-balance mb-8">
            Esta página es para probar la funcionalidad de conversación en tiempo real con el backend. Aquí podrás ver cómo se manejan las conexiones, el historial de chat y la visualización de audio en una interfaz simple.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300 text-balance mb-4">
            Para comenzar, haz clic en el botón de abajo para iniciar la conexión con el backend y ver cómo se actualiza el historial de chat y la visualización de audio en tiempo real.
          </p>
        </div>
      </div>
      <div>
        <LiveCanvas />
      </div>
    </main>
  );
}