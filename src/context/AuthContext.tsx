import React, { createContext, useContext, useEffect, useState } from "react";
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

// --- CONFIGURATION DISCORD ---
const DISCORD_GUILD_ID = "1434106360395726860"; 
const REQUIRED_ROLE_ID = "1486827290561085731";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchExtendedUser = async (currentSession: Session | null) => {
    const authUser = currentSession?.user;

    if (!authUser) {
      console.log("📡 [Auth] Aucun utilisateur détecté.");
      setUser(null);
      setLoading(false);
      return;
    }
    
    try {
      // 🛡️ 1. VÉRIFICATION DU GRADE DISCORD (Uniquement si on a le token frais)
      if (currentSession?.provider_token) {
        const checkKey = `discord_ok_${authUser.id}`;
        const isVerified = sessionStorage.getItem(checkKey);
        
        if (!isVerified) {
          console.log("🛡️ [Discord] Nouveau login détecté, vérification du grade...");
          
          const discordRes = await fetch(
            `https://discord.com/api/users/@me/guilds/${DISCORD_GUILD_ID}/member`,
            { headers: { Authorization: `Bearer ${currentSession.provider_token}` } }
          );

          if (discordRes.status === 429) {
            console.warn("⚠️ [Discord] RATE LIMIT. On patiente...");
            setLoading(false); return;
          }

          if (discordRes.ok) {
            const memberData = await discordRes.json();
            const hasRole = memberData.roles.includes(REQUIRED_ROLE_ID);
            
            if (!hasRole) {
              console.error("❌ [Discord] Grade manquant.");
              await supabase.auth.signOut();
              setUser(null); setLoading(false); return;
            }
            console.log("✅ [Discord] Grade validé.");
            sessionStorage.setItem(checkKey, "true");
          } else {
            console.error("❌ [Discord] Absent du serveur ou erreur API.");
            await supabase.auth.signOut();
            setUser(null); setLoading(false); return;
          }
        }
      } else {
        console.log("ℹ️ [Auth] Session restaurée (pas de token Discord direct). On se base sur la DB.");
      }

      // 🗄️ 2. SYNCHRONISATION TABLE PLAYERS
      let { data: playerInfo } = await getPlayerById(authUser.id);

      if (!playerInfo) {
        // Si le joueur est connecté via Discord mais n'est pas en DB 
        // ET qu'on n'a pas pu vérifier son grade (pas de token), on le rejette par sécurité
        if (!currentSession?.provider_token) {
            console.error("❌ [Auth] Joueur inconnu en DB et pas de jeton pour vérifier son grade.");
            await supabase.auth.signOut();
            setUser(null); setLoading(false); return;
        }

        console.log("📝 [DB] Création du profil...");
        const discordName = authUser.user_metadata?.custom_claims?.global_name 
                         || authUser.user_metadata?.full_name 
                         || "Soldat Inconnu";
                         
        const avatarUrl = authUser.user_metadata?.avatar_url || null;

        const { data: newPlayer, error: insertError } = await supabase
          .from("players")
          .insert([{ id: authUser.id, discord_name: discordName, avatar_url: avatarUrl, isAdmin: false }])
          .select().maybeSingle();

        if (insertError) {
            console.error("❌ [DB] Erreur création :", insertError);
        } else {
            playerInfo = newPlayer;
        }
      }

      // 🎉 3. VALIDATION FINALE
      if (playerInfo) {
        console.log("✅ [Auth] Accès autorisé pour :", playerInfo.discord_name);
        setUser({ ...authUser, isAdmin: playerInfo.isAdmin ?? false });
      }

    } catch (error) {
      console.error("💥 [Auth] Erreur critique :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. On récupère la session initiale proprement
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log("🎬 [Auth] Session Initiale :", initialSession ? "Trouvée ✅" : "Aucune ❌");
        setSession(initialSession);
        await fetchExtendedUser(initialSession);
      } catch (err) {
        console.error("❌ [Auth] Erreur init session:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 2. On écoute les changements (Login / Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log(`🔄 [Auth] Événement : ${event}`);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(currentSession);
        await fetchExtendedUser(currentSession);
      } 
      
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        sessionStorage.clear();
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithDiscord = async () => {
    console.log("🚀 [Auth] Lancement OAuth Discord...");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { 
        scopes: "identify email guilds guilds.members.read",
        redirectTo: window.location.origin + "/wishlist" 
      },
    });
    if (error) {
        console.error("❌ [Auth] Erreur OAuth :", error);
        throw error;
    }
  };

  const signOut = async () => {
    console.log("👋 [Auth] Déconnexion...");
    sessionStorage.clear();
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
  if (context === undefined) throw new Error("useAuth requis");
  return context;
};