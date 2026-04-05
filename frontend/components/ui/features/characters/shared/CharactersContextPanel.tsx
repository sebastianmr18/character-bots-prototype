'use client';

import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import type { Character } from '@/types/chat.types';
import { colorFromName, lightColorFromName } from '@/utils/character.utils';

interface CharacterContextPanelProps {
    character: Character;
}

export function CharacterContextPanel({
    character,
}: CharacterContextPanelProps) {
    const themeColor = character.themeColor ?? colorFromName(character.name)
    const themeColorLight = character.themeColorLight ?? lightColorFromName(character.name)
    const characterImageUrl = character.imageUrl ?? (character as Character & { image_url?: string | null }).image_url ?? null;
    const backgroundImageUrl = character.backgroundImageUrl ?? null;
    const [avatarImageError, setAvatarImageError] = useState(false);

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
            </div>
        </div>
    );
}
