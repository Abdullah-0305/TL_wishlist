import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { getPlayerById } from "@/api/db";

interface ExtendedUser extends User {
  isAdmin?: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: ExtendedUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithDiscord: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DISCORD_GUILD_ID = "1434106360395726860"; 
const REQUIRED_ROLE_ID = "1486827290561085731";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Verrou pour empêcher les appels multiples simultanés
  const isprocessing = useRef(false);

  const fetchExtendedUser = async (currentSession: Session | null) => {
    // Si on est déjà en train de traiter une vérification, on sort
    if (isprocessing.current) return;
    
    const authUser = currentSession?.user;
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      isprocessing.current = true;
      console.log("🚀 [Auth] Début du traitement de session...");

      // 1. VÉRIFICATION DISCORD (Uniquement si nouveau login avec token)
      if (currentSession?.provider_token) {
        const checkKey = `discord_verified_${authUser.id}`;
        if (!sessionStorage.getItem(checkKey)) {
          
          const discordRes = await fetch(
            `https://discord.com/api/users/@me/guilds/${DISCORD_GUILD_ID}/member`,
            { headers: { Authorization: `Bearer ${currentSession.provider_token}` } }
          );

          if (discordRes.status === 429) {
            console.error("🛑 [Discord] Trop de requêtes (429). Arrêt pour éviter le ban.");
            isprocessing.current = false;
            return; 
          }

          if (discordRes.ok) {
            const memberData = await discordRes.json();
            if (!memberData.roles.includes(REQUIRED_ROLE_ID)) {
              console.error("❌ [Discord] Grade manquant.");
              await supabase.auth.signOut();
              isprocessing.current = false;
              return;
            }
            sessionStorage.setItem(checkKey, "true");
            console.log("✅ [Discord] Grade validé.");
          } else {
            console.error("❌ [Discord] Erreur API ou absent du serveur.");
            await supabase.auth.signOut();
            isprocessing.current = false;
            return;
          }
        }
      }

      // 2. RÉCUPÉRATION / CRÉATION EN DB
      let { data: playerInfo } = await getPlayerById(authUser.id);

      if (!playerInfo && currentSession?.provider_token) {
        const discordName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || "Soldat";
        const { data: newPlayer } = await supabase
          .from("players")
          .insert([{ id: authUser.id, discord_name: discordName, isAdmin: false }])
          .select().maybeSingle();
        playerInfo = newPlayer;
      }

      if (playerInfo) {
        setUser({ ...authUser, isAdmin: playerInfo.isAdmin });
      }

    } catch (error) {
      console.error("💥 [Auth] Erreur critique:", error);
    } finally {
      isprocessing.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialisation unique
    const init = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      if (s) await fetchExtendedUser(s);
      else setLoading(false);
    };
    init();

    // Écouteur d'événements filtré
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      console.log(`🔄 [Auth] Event: ${event}`);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(s);
        fetchExtendedUser(s);
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
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { 
        scopes: "identify email guilds guilds.members.read",
        redirectTo: window.location.origin + "/wishlist" 
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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