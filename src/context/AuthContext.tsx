import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { getPlayerById } from "@/api/db";

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
      
      // Nom par défaut (Metadatas Supabase)
      let effectiveName = authUser.user_metadata?.full_name || authUser.user_metadata?.name;
      let hasDiscordData = false;

      // 1. VÉRIFICATION DISCORD (Pseudo Serveur & Rôles)
      if (currentSession.provider_token) {
        if (!sessionStorage.getItem(checkKey) || isSigningUp) {
          const discordRes = await fetch(
            `https://discord.com/api/users/@me/guilds/${DISCORD_GUILD_ID}/member`,
            { headers: { Authorization: `Bearer ${currentSession.provider_token}` } }
          );

          if (discordRes.ok) {
            const memberData = await discordRes.json();
            hasDiscordData = true; // On confirme qu'on a les infos fraîches du serveur

            // Priorité au pseudo du serveur (nick)
            if (memberData.nick) {
              effectiveName = memberData.nick;
            } else if (memberData.user?.global_name) {
              effectiveName = memberData.user.global_name;
            }

            // Vérification du rôle requis
            if (!memberData.roles.includes(REQUIRED_ROLE_ID)) {
              await signOut();
              return;
            }
            sessionStorage.setItem(checkKey, "true");
          } else if (discordRes.status === 429) {
            // Rate limit : on sort proprement pour laisser le loading finir
            setLoading(false);
            return; 
          } else {
            // Erreur critique (ex: banni du serveur)
            await signOut();
            return;
          }
        }
      }

      // 2. RÉCUPÉRATION / CRÉATION EN DB
      let { data: playerInfo } = await getPlayerById(authUser.id);

      // Création automatique si premier login
      if (!playerInfo && isSigningUp) {
        const { data: newPlayer } = await supabase
          .from("players")
          .insert([{ 
            id: authUser.id, 
            discord_name: effectiveName, 
            avatar_url: authUser.user_metadata?.avatar_url, 
            is_admin: false 
          }])
          .select().maybeSingle();
        playerInfo = newPlayer;
      }

      // 3. SYNCHRONISATION (Nom et Avatar)
      if (playerInfo) {
        // IMPORTANT : On ne met à jour le nom QUE SI on vient de le récupérer via Discord (hasDiscordData)
        // Sinon, au refresh (F5), effectiveName redevient le nom global et écraserait le pseudo serveur.
        const nameNeedsUpdate = hasDiscordData && effectiveName && playerInfo.discord_name !== effectiveName;
        const avatarNeedsUpdate = authUser.user_metadata?.avatar_url !== playerInfo.avatar_url;

        if (nameNeedsUpdate || avatarNeedsUpdate) {
          const { data: updatedPlayer } = await supabase
            .from("players")
            .update({ 
              discord_name: nameNeedsUpdate ? effectiveName : playerInfo.discord_name,
              avatar_url: authUser.user_metadata?.avatar_url 
            })
            .eq("id", authUser.id)
            .select()
            .single();
            
          if (updatedPlayer) playerInfo = updatedPlayer;
        }
      }

      // 4. Finalisation de la session application
      if (playerInfo) {
        setUser({ ...authUser, is_admin: playerInfo.is_admin });
        sessionStorage.removeItem("is_signing_up"); 
      } else {
        // Si le joueur n'est ni en DB ni créable, on déconnecte
        if (!isSigningUp) await signOut();
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
        scopes: "identify guilds guilds.members.read", // Déjà correct
        queryParams: {
          prompt: 'consent', // Force l'affichage de la fenêtre de consentement pour voir les changements
          scope: 'identify guilds guilds.members.read' // On le ré-injecte ici par sécurité
        },
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
    setLoading(false);
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