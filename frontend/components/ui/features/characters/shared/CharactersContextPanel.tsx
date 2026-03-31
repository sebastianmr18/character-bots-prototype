'use client';

import { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Clock, Loader2 } from 'lucide-react';
import type { Character, Conversation } from '@/types/chat.types';
import { colorFromName, lightColorFromName } from '@/utils/character.utils';

interface CharacterContextPanelProps {
    character: Character;
    onSelectConversation?: (conversation: { id: string; mode?: 'single' | 'debate' }) => void;
    selectedConversationId?: string;
    onInitialHistoryLoaded?: () => void;
}

export function CharacterContextPanel({
    character,
    onSelectConversation,
    selectedConversationId,
    onInitialHistoryLoaded,
}: CharacterContextPanelProps) {
    const themeColor = character.themeColor ?? colorFromName(character.name)
    const themeColorLight = character.themeColorLight ?? lightColorFromName(character.name)
    const characterImageUrl = character.imageUrl ?? (character as Character & { image_url?: string | null }).image_url ?? null;
    const backgroundImageUrl = character.backgroundImageUrl ?? null;
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [avatarImageError, setAvatarImageError] = useState(false);
    const [hasNotifiedInitialHistoryLoaded, setHasNotifiedInitialHistoryLoaded] = useState(false);

    const fetchConversations = useCallback(async () => {
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

            if (!hasNotifiedInitialHistoryLoaded) {
                onInitialHistoryLoaded?.();
                setHasNotifiedInitialHistoryLoaded(true);
            }
        }
    }, [character.id, hasNotifiedInitialHistoryLoaded, onInitialHistoryLoaded]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        const onConversationCreated = () => {
            fetchConversations();
        };

        window.addEventListener('conversation:created', onConversationCreated);
        return () => {
            window.removeEventListener('conversation:created', onConversationCreated);
        };
    }, [fetchConversations]);

    useEffect(() => {
        setAvatarImageError(false);
    }, [characterImageUrl]);

    return (
        <div className="h-full flex flex-col">
            {/* Ambient Header */}
            <div
                className="relative h-64 sm:h-80 flex flex-col justify-end p-6"
                style={{
                    backgroundColor: themeColorLight,
                    ...(backgroundImageUrl && {
                        backgroundImage: `url(${backgroundImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }),
                }}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <pattern id="ambient-pattern" patternUnits="userSpaceOnUse" width="10" height="10">
                            <circle cx="5" cy="5" r="1" fill={themeColor} />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#ambient-pattern)" />
                    </svg>
                </div>

                {/* Character Avatar */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2">
                    <div
                        className="w-40 h-40 sm:w-40 sm:h-40 rounded-full flex items-center justify-center border-4 border-background shadow-xl overflow-hidden"
                        style={{ backgroundColor: themeColor }}
                    >
                        {characterImageUrl && !avatarImageError ? (
                            <img
                                src={characterImageUrl}
                                alt={character.name}
                                className="w-full h-full object-cover"
                                onError={() => setAvatarImageError(true)}
                            />
                        ) : (
                            <span className="text-4xl sm:text-5xl font-serif font-bold text-white">
                                {character.name[0]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Character Info */}
                <div className="relative text-center mt-16 bg-white/80 backdrop-blur-sm rounded-lg p-4">
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-1">
                        {character.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {character.role}
                    </p>
                    {(character.years || character.category) && (
                        <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                            {character.category && (
                                <span
                                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    {character.category}
                                </span>
                            )}
                            {character.years && (
                                <span className="text-xs text-muted-foreground">{character.years}</span>
                            )}
                        </div>
                    )}
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
                <section>
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        De qué quieres hablar?
                    </h3>
                    {character.topics && character.topics.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {character.topics.map((topic) => (
                                <span
                                    key={topic}
                                    className="px-3 py-1 rounded-full text-sm border border-border bg-muted text-foreground"
                                >
                                    {topic}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">
                            Las sugerencias de temas estarán disponibles próximamente.
                        </p>
                    )}
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
                                <button
                                    key={conv.id}
                                    onClick={() => onSelectConversation?.({ id: conv.id, mode: conv.mode })}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer ${
                                        selectedConversationId === conv.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    <MessageSquare className="h-4 w-4 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate flex items-center gap-2">
                                            Conversación
                                            {conv.mode === 'debate' && (
                                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                                    selectedConversationId === conv.id
                                                        ? 'bg-primary-foreground/20 text-primary-foreground'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    Debate
                                                </span>
                                            )}
                                        </p>
                                        <p className={`text-xs ${
                                            selectedConversationId === conv.id
                                                ? 'text-primary-foreground/70'
                                                : 'text-muted-foreground'
                                        }`}>
                                            {new Date(conv.createdAt).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
