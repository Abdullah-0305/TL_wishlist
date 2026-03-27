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

      // 1. VÉRIFICATION DISCORD
      // On vérifie si on a le token ET (si pas de cache OU si on est en train de se loguer proprement)
      if (currentSession.provider_token) {
        if (!sessionStorage.getItem(checkKey) || isSigningUp) {
          const discordRes = await fetch(
            `https://discord.com/api/users/@me/guilds/${DISCORD_GUILD_ID}/member`,
            { headers: { Authorization: `Bearer ${currentSession.provider_token}` } }
          );

          if (discordRes.ok) {
            const memberData = await discordRes.json();
            if (!memberData.roles.includes(REQUIRED_ROLE_ID)) {
              await signOut();
              return;
            }
            sessionStorage.setItem(checkKey, "true");
          } else if (discordRes.status === 429) {
            return; // On ne fait rien si Rate Limit, on réessaiera
          } else {
            await signOut();
            return;
          }
        }
      }

      // 2. RÉCUPÉRATION / CRÉATION EN DB
      let { data: playerInfo } = await getPlayerById(authUser.id);

      // Si pas en base et qu'on vient de cliquer sur Login -> On crée
      if (!playerInfo && isSigningUp && currentSession.provider_token) {
        const discordName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || "Soldat";
        const { data: newPlayer } = await supabase
          .from("players")
          .insert([{ 
            id: authUser.id, 
            discord_name: discordName, 
            avatar_url: authUser.user_metadata?.avatar_url, 
            isAdmin: false 
          }])
          .select().maybeSingle();
        playerInfo = newPlayer;
      }

      // 3. VERDICT FINAL
      if (playerInfo) {
        setUser({ ...authUser, isAdmin: playerInfo.isAdmin });
        // On ne nettoie le "is_signing_up" qu'une fois que tout est OK
        sessionStorage.removeItem("is_signing_up"); 
      } else {
        await signOut();
      }

    } catch (error) {
      console.error("Erreur Auth:", error);
    } finally {
      isprocessing.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      
      if (s) {
        // Force le re-check Discord au rafraîchissement (F5)
        // Mais UNIQUEMENT si on n'est pas en train de revenir d'un clic de login
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
    // On marque l'intention AVANT
    sessionStorage.setItem("is_signing_up", "true");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { 
        scopes: "identify email guilds guilds.members.read",
        redirectTo: window.location.origin + "/wishlist" 
      },
    });
    if (error) {
        sessionStorage.removeItem("is_signing_up");
        setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    sessionStorage.clear();
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