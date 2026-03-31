import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { getPlayerById } from "@/api/db";
import { toast } from "sonner";

interface ExtendedUser extends User {
  is_admin?: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: ExtendedUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithDiscord: () => Promise<void>;
}

const DISCORD_GUILD_ID = import.meta.env.VITE_DISCORD_GUILD_ID;
const REQUIRED_ROLE_ID = import.meta.env.VITE_REQUIRED_ROLE_ID;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isprocessing = useRef(false);

  const fetchExtendedUser = async (currentSession: Session | null) => {
    if (isprocessing.current || !currentSession?.user) return;

    try {
      isprocessing.current = true;
      const authUser = currentSession.user;
      const checkKey = `discord_verified_${authUser.id}`;
      const isSigningUp = sessionStorage.getItem("is_signing_up") === "true";
      
      let effectiveName = authUser.user_metadata?.full_name || authUser.user_metadata?.name;

      // 1. VÉRIFICATION DISCORD
      if (currentSession.provider_token) {
        const needsCheck = !sessionStorage.getItem(checkKey) || isSigningUp;
        
        if (needsCheck) {
          const discordRes = await fetch(
            `https://discord.com/api/users/@me/guilds/${DISCORD_GUILD_ID}/member`,
            { headers: { Authorization: `Bearer ${currentSession.provider_token}` } }
          );

          if (discordRes.ok) {
            const memberData = await discordRes.json();
            
            if (memberData.nick) effectiveName = memberData.nick;
            else if (memberData.user?.global_name) effectiveName = memberData.user.global_name;

            // --- ERREUR DE RÔLE ---
            if (!memberData.roles.includes(REQUIRED_ROLE_ID)) {
              toast.error("Accès refusé : Rôle Trinity requis manquant.", {
                description: "Vérifie tes rôles sur le serveur Discord.",
                duration: 5000,
              });
              
              // On attend 2 secondes avant de déconnecter pour que le toast soit vu
              setTimeout(() => signOut(), 2000);
              return; // STOP ICI
            }
            sessionStorage.setItem(checkKey, "true");
          } else if (discordRes.status === 429) {
             toast.warning("Discord sature, accès temporaire activé.");
          } else {
             toast.error("Session Discord invalide ou membre introuvable.");
             setTimeout(() => signOut(), 2000);
             return; // STOP ICI
          }
        }
      }

      // 2. UPSERT EN BASE
      const { data: playerInfo, error: dbError } = await supabase
        .from("players")
        .upsert({ 
          id: authUser.id, 
          discord_name: effectiveName, 
          avatar_url: authUser.user_metadata?.avatar_url,
        }, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (dbError) {
        toast.error("Erreur de synchronisation avec la base de données.");
        throw dbError;
      }

      // 3. FINALISATION
      if (playerInfo) {
        setUser({ ...authUser, is_admin: playerInfo.is_admin });
        
        if (isSigningUp) {
          // Petit délai pour le succès pour ne pas l'avoir pile au chargement
          setTimeout(() => {
            toast.success(`Content de te voir, ${effectiveName} !`, {
              icon: "⚔️",
            });
          }, 500);
          sessionStorage.removeItem("is_signing_up"); 
        }
      } else {
        await signOut();
      }

    } catch (error) {
      console.error("Erreur Auth Global:", error);
      // On ne met un toast générique que si aucun autre n'a été déclenché
    } finally {
      isprocessing.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      
      if (s) {
        // Force le re-check Discord au refresh sauf si on vient de cliquer sur Login
        if (sessionStorage.getItem("is_signing_up") !== "true") {
          sessionStorage.removeItem(`discord_verified_${s.user.id}`);
        }
        setSession(s);
        await fetchExtendedUser(s);
      } else {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(s);
        if (s) fetchExtendedUser(s);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setLoading(false);
        sessionStorage.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithDiscord = async () => {
    setLoading(true);
    sessionStorage.setItem("is_signing_up", "true");
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { 
        scopes: "identify guilds guilds.members.read",
        queryParams: {
          prompt: 'consent',
          scope: 'identify guilds guilds.members.read'
        },
        redirectTo: `${window.location.origin}/wishlist`
      },
    });

    if (error) {
        sessionStorage.removeItem("is_signing_up");
        toast.error("Échec de la connexion Discord.");
        setLoading(false);
    }
  };

  const signOut = async () => {
    isprocessing.current = false; // Reset du verrou avant de quitter
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setLoading(false);
    sessionStorage.clear();
    toast.info("Session terminée.");
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, signInWithDiscord }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth requis");
  return context;
};