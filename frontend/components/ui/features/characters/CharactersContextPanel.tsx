'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Clock, Loader2 } from 'lucide-react';
import type { Character, Conversation } from '@/types/chat.types';

interface CharacterContextPanelProps {
    character: Character;
}

// TODO: Derivar themeColor y themeColorLight desde los datos del personaje
// cuando se agregue ese campo a la BD, o generar determinísticamente desde `name`.
const PLACEHOLDER_THEME_COLOR = 'oklch(0.40 0.10 250)';
const PLACEHOLDER_THEME_COLOR_LIGHT = 'oklch(0.92 0.03 250)';

export function CharacterContextPanel({ character }: CharacterContextPanelProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setIsLoadingConversations(true);
                const response = await fetch('/api/conversations');
                if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
                const data: Conversation[] = await response.json();
                const forThisCharacter = data.filter(
                    (c) => c.character?.id === character.id
                );
                setConversations(forThisCharacter);
            } catch (err) {
                console.error('Error al cargar conversaciones:', err);
            } finally {
                setIsLoadingConversations(false);
            }
        };

        fetchConversations();
    }, [character.id]);

    return (
        <div className="h-full flex flex-col">
            {/* Ambient Header */}
            <div
                className="relative h-64 sm:h-80 flex flex-col justify-end p-6"
                style={{ backgroundColor: PLACEHOLDER_THEME_COLOR_LIGHT }}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <pattern id="ambient-pattern" patternUnits="userSpaceOnUse" width="10" height="10">
                            <circle cx="5" cy="5" r="1" fill="currentColor" style={{ color: PLACEHOLDER_THEME_COLOR }} />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#ambient-pattern)" />
                    </svg>
                </div>

                {/* Character Avatar */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2">
                    <div
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center border-4 border-background shadow-xl"
                        style={{ backgroundColor: PLACEHOLDER_THEME_COLOR }}
                    >
                        <span className="text-4xl sm:text-5xl font-serif font-bold text-white">
                            {character.name[0]}
                        </span>
                    </div>
                </div>

                {/* Character Info */}
                <div className="relative text-center mt-16">
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-1">
                        {character.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {/* TODO: Mostrar years y category cuando estén disponibles en la BD */}
                        {character.role}
                    </p>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">

                {/* Biography */}
                {character.biography && (
                    <section>
                        <p className="text-muted-foreground leading-relaxed">
                            {character.biography}
                        </p>
                    </section>
                )}

                {/* Topic Suggestions */}
                {/* TODO: Implementar sugerencias de temas cuando el campo `topics` esté disponible en la BD */}
                <section>
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        De qué quieres hablar?
                    </h3>
                    <p className="text-sm text-muted-foreground italic">
                        Las sugerencias de temas estarán disponibles próximamente.
                    </p>
                </section>

                {/* Session History — conversaciones reales */}
                <section>
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Historial de conversaciones
                    </h3>

                    {isLoadingConversations ? (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cargando conversaciones...
                        </div>
                    ) : conversations.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                            Aún no tienes conversaciones con este personaje.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted text-left"
                                >
                                    <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            Conversación
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(conv.createdAt).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
