"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen } from 'lucide-react';

export function Footer() {
    const pathname = usePathname();
    if (pathname.startsWith('/login') || pathname.startsWith('/auth')) {
        return null
    }
    return (
        <footer className="bg-card border-t border-border py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo & Description */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <BookOpen className="h-6 w-6 text-primary" />
                            <span className="font-serif text-xl font-semibold text-foreground">Historichat</span>
                        </Link>
                        <p className="text-muted-foreground max-w-md leading-relaxed">
                            Una plataforma para explorar la historia y las ideas a traves de conversaciones
                            con las mentes mas brillantes que han existido.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Explorar</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/personajes" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Personajes
                                </Link>
                            </li>
                            <li>
                                <Link href="/#modos" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Modos de conversacion
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* More Links */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Cuenta</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Iniciar sesion
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
                    <p>Historichat - Conversaciones que trascienden el tiempo</p>
                </div>
            </div>
        </footer>
    );
}
