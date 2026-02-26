
import { Tool, Type } from '@google/genai';

export interface Transcription {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

// types/live.types.ts o donde prefieras
export const RAG_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "consultar_informacion_SHELDON",
        description: "Consulta la base de conocimientos de Sheldon (anécdotas, física, contratos, etc.)",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description: "La pregunta o tema sobre el cual buscar información"
            }
          },
          required: ["query"]
        },
        response: {
          type: Type.OBJECT,
          properties: {
            context: {
              type: Type.STRING,
              description: "Información relevante recuperada de la base de conocimientos"
            }
          },
          required: ["context"]
        }
      }
    ]
  }
];
