"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter();

  const handleSignIn = (provider: string) => {
    // Aquí iría el inicio del flujo OAuth2 (p.ej. /api/auth/${provider})
    // Por ahora sólo redirigimos visualmente a /home
    router.push("/home");
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 520, padding: 32, borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Iniciar sesión</h1>
        <p style={{ color: "#666", marginTop: 8 }}>Accede usando Google o Facebook</p>

        <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
          <button
            onClick={handleGoogleLogin}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #e6e6e6",
              background: "black",
              cursor: "pointer",
              fontWeight: 600,
            }}
            aria-label="Iniciar sesión con Google"
          >
            <img src="/google-logo.png" alt="Google" style={{ width: 18, height: 18 }} onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />
            Continuar con Google
          </button>

          <button
            onClick={() => handleSignIn("facebook")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #e6e6e6",
              background: "#1877F2",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
            aria-label="Iniciar sesión con Facebook"
          >
            <img src="/facebook-logo.png" alt="Facebook" style={{ width: 18, height: 18, filter: 'brightness(0) invert(1)' }} onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />
            Continuar con Facebook
          </button>
        </div>

        <p style={{ marginTop: 18, fontSize: 13, color: "#666" }}>Esta es una vista visual. Al hacer clic serás redirigido a la página principal.</p>
      </div>
    </div>
  );
}
