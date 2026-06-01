import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { UserCheck, UserX, UserMinus, Search, RefreshCw, Scan, UserCog, UserPlus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  discord_id: string;
  discord_name: string;
  is_online: boolean;
  role?: string | null;
}

interface RHSignup {
  userid: string;
  name: string;
  className: string;
  specName: string;
}

interface StatRecord {
  id: string;
  name: string;
  discord_id: string;
  class?: string;
  spec?: string;
}

const ABSENT_RH_CLASSES = ["Absence", "Tentative", "Bench", "Late"];

// 🧠 Fonction extraite pour calculer les listes de manière synchrone pendant le scan
const calculateLists = (signups: RHSignup[], players: Player[]) => {
  const onlinePlayers = players.filter(p => p.is_online);
  const offlinePlayers = players.filter(p => !p.is_online);
  
  const expectedSignups = signups.filter(rh => !ABSENT_RH_CLASSES.includes(rh.className));
  const declaredAbsents = signups.filter(rh => ABSENT_RH_CLASSES.includes(rh.className));

  return {
    presentRegistered: expectedSignups.filter(rh => onlinePlayers.some(p => p.discord_id === rh.userid)),
    presentUnregisteredOrAbsent: onlinePlayers.filter(p => !expectedSignups.some(rh => rh.userid === p.discord_id)),
    absentRegisteredAbsent: declaredAbsents.filter(rh => !onlinePlayers.some(p => p.discord_id === rh.userid)),
    unregistered: offlinePlayers.filter(p => !signups.some(rh => rh.userid === p.discord_id)),
    absentRegisteredPresent: expectedSignups.filter(rh => !onlinePlayers.some(p => p.discord_id === rh.userid))
  };
};

const Attendance = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [eventId, setEventId] = useState("");
  const [eventName, setEventName] = useState("");

  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [rhSignups, setRhSignups] = useState<RHSignup[]>([]);

  // L'affichage de l'UI utilise toujours le useMemo, mais basé sur la fonction isolée
  const lists = useMemo(() => calculateLists(rhSignups, allPlayers), [rhSignups, allPlayers]);
  const { presentRegistered, presentUnregisteredOrAbsent, absentRegisteredAbsent, unregistered, absentRegisteredPresent } = lists;

  const fetchEventIdWithSupabase = async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("event-raid-helper");
    if (error) throw error;
    
    if (data === "Aucun événement dans l'intervalle de 30 minutes.") {
      throw new Error("Aucun événement trouvé");
    }
    return data;
  };

  const getRHSignups = async (id: string) => {
    const { data, error } = await supabase.functions.invoke("raid-helper", {
      body: { eventId: id },
    }); 
    if (error) throw error;
    
    // On retourne le titre ET les inscrits pour l'utiliser tout de suite dans la fonction parente
    return { signups: data.signups, title: data.title };
  };

  const saveStatsToDatabase = async (id: string, currentEventName: string, calculatedLists: any) => {
  try {
    const formatPlayer = (p: any): StatRecord => ({
      id: p.userid || p.id,
      name: p.name || p.discord_name,
      discord_id: p.userid || p.discord_id,
      class: p.className,
      spec: p.specName,
    });

    const payload = {
      event_id: id,
      event_name: currentEventName,
      event_date: new Date().toISOString().split("T")[0],
      scan_timestamp: new Date().toISOString(),
      players_present_registered: calculatedLists.presentRegistered.map(formatPlayer),
      players_present_unregistered_or_absent: calculatedLists.presentUnregisteredOrAbsent.map(formatPlayer),
      players_absent_registered_absent: calculatedLists.absentRegisteredAbsent.map(formatPlayer),
      players_unregistered: calculatedLists.unregistered.map(formatPlayer),
      players_absent_registered_present: calculatedLists.absentRegisteredPresent.map(formatPlayer),
    };

    // 1. On cherche s'il existe déjà des stats pour cet event_id
    const { data: existingEvents, error: fetchError } = await supabase
      .from("raid_events_stats")
      .select("id")
      .eq("event_id", id);

    if (fetchError) throw fetchError;

    if (existingEvents && existingEvents.length > 0) {
      // 2. Si oui, on écrase les données existantes en ciblant l'event_id
      const { error } = await supabase
        .from("raid_events_stats")
        .delete()
        .eq("event_id", id);

      if (error) throw error;
      toast.success("Stats mises à jour avec succès !");
    }
    const { error } = await supabase
      .from("raid_events_stats")
      .insert(payload);

    if (error) throw error;
    toast.success("Stats enregistrées avec succès !");
  } catch (error: any) {
    console.error("Erreur de base de données :", error);
    toast.error(error.message || "Erreur lors de l'enregistrement des stats");
  }
};

  const handleScan = async () => {
    setLoading(true);
    const toastId = toast.loading("Scan en cours...");

    try {
      const currentEventId = await fetchEventIdWithSupabase();
      
      // 1. Récupération synchrone des données
      const { signups, title } = await getRHSignups(currentEventId);
      
      const { data: dbPlayers, error: dbError } = await supabase
        .from("players")
        .select("*");
      if (dbError) throw dbError;

      // 2. Calcul des listes immédiatement avec les nouvelles données
      const freshPlayers = dbPlayers || [];
      const freshLists = calculateLists(signups, freshPlayers);

      // 3. Sauvegarde dans la DB avec les données à jour
      await saveStatsToDatabase(currentEventId, title, freshLists);
      
      // 4. Seulement à la fin, on met à jour les états React pour l'interface
      setEventId(currentEventId);
      setEventName(title);
      setRhSignups(signups);
      setAllPlayers(freshPlayers);
      setLastScan(new Date());

      toast.success("Scan terminé avec succès !", { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors du scan", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const wakeUpBot = async () => {
      const toastId = toast.loading("Réveil du bot en cours (peut prendre jusqu'à 60s)...");
      try {
        await fetch("https://wishlist-bot-lyy7.onrender.com/", { mode: 'no-cors' });
        toast.success("Signal envoyé ! Attendez quelques secondes puis faites le Scan.", { id: toastId, duration: 5000 });
      } catch (error) {
        console.error("Erreur Wake Bot:", error);
        toast.error("Erreur lors de l'appel au bot.", { id: toastId });
      }
    };

  const StatCard = ({ title, count, icon: Icon, color, bg }: any) => (
    <div className={cn("p-4 rounded-2xl border shadow-lg relative overflow-hidden group transition-all", bg, color)}>
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{title}</span>
          <p className="text-3xl font-black">{count}</p>
        </div>
        <div className="p-2 bg-black/20 rounded-xl backdrop-blur-md">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );

  const PlayerList = ({ title, players, icon: Icon, color, borderColor, bgColor }: any) => (
    <div className={cn("bg-[#1e1333]/50 border rounded-2xl p-4 h-full flex flex-col", borderColor)}>
      <h3 className={cn("font-black uppercase tracking-widest text-[10px] mb-4 border-b pb-2 flex items-center gap-2", color, borderColor)}>
        <Icon className="h-4 w-4" /> {title} ({players.length})
      </h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar flex-1">
        {players.length === 0 ? (
          <div className="text-xs text-zinc-500 italic p-2">Aucun</div>
        ) : (
          players.map((player: any) => (
            <div key={player.userid || player.id} className={cn("p-2 rounded-lg text-xs font-semibold border", bgColor)}>
              <div className="flex justify-between items-center">
                <span className="truncate">{player.name || player.discord_name}</span>
                {player.className && (
                  <span className="text-[9px] opacity-70 whitespace-nowrap ml-2">
                    {player.className} {player.specName && `• ${player.specName}`}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0b10] text-zinc-100 pb-20 p-4 md:p-10 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3 bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
              <Search className="h-10 w-10 text-emerald-500" />
              Scan de Présence
            </h1>
            <p className="text-zinc-400 font-medium mt-2 text-sm">
              Croisement Vocal Discord & Inscriptions Raid-Helper
            </p>
          </div>

          {/* Conteneur Flex pour aligner les boutons côte à côte */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={wakeUpBot}
              variant="outline"
              className="bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500 hover:text-white font-bold h-12 px-4 flex lg:flex-none gap-2 transition-all"
            >
              <Zap className="h-4 w-4" /> Réveiller Bot
            </Button>

            <Button
              onClick={handleScan}
              disabled={loading}
              className="h-12 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <><Scan className="h-5 w-5 mr-2" /> Scan</>}
            </Button>
          </div>
        </div>

        {/* RÉSULTATS */}
        {lastScan && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* INFO SCAN */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 font-bold uppercase tracking-widest">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                {eventName}
              </span>
              <span className="bg-white/5 px-3 py-1.5 rounded-full">Dernier scan : {lastScan.toLocaleTimeString()}</span>
              <span className="bg-white/5 px-3 py-1.5 rounded-full">Event ID : {eventId}</span>
              <span className="bg-white/5 px-3 py-1.5 rounded-full">Inscrits RH : {rhSignups.length} | DB : {allPlayers.length}</span>
            </div>

            {/* STATS CARDS (5 colonnes) */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
              <StatCard title="Présent & Inscrit" count={presentRegistered.length} icon={UserCheck} bg="bg-emerald-500/10 border-emerald-500/30" color="text-emerald-400" />
              <StatCard title="Présent + Imprévu" count={presentUnregisteredOrAbsent.length} icon={UserPlus} bg="bg-amber-500/10 border-amber-500/30" color="text-amber-400" />
              <StatCard title="Absent & Excusé" count={absentRegisteredAbsent.length} icon={UserCog} bg="bg-blue-500/10 border-blue-500/30" color="text-blue-400" />
              <StatCard title="Non-inscrit (Fantôme)" count={unregistered.length} icon={UserMinus} bg="bg-zinc-500/10 border-zinc-500/30" color="text-zinc-400" />
              <StatCard title="Absent & Inscrit (No-Show)" count={absentRegisteredPresent.length} icon={UserX} bg="bg-red-500/10 border-red-500/30" color="text-red-400" />
            </div>

            {/* LISTES (5 colonnes) */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-stretch">
              <PlayerList
                title="Présents & Inscrits"
                players={presentRegistered}
                icon={UserCheck}
                color="text-emerald-400"
                borderColor="border-emerald-500/20"
                bgColor="bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
              />
              <PlayerList
                title="Présents (Non-insc/Abs)"
                players={presentUnregisteredOrAbsent}
                icon={UserPlus}
                color="text-amber-400"
                borderColor="border-amber-500/20"
                bgColor="bg-amber-500/10 border-amber-500/20 text-amber-200"
              />
              <PlayerList
                title="Absents (Inscrits Abs)"
                players={absentRegisteredAbsent}
                icon={UserCog}
                color="text-blue-400"
                borderColor="border-blue-500/20"
                bgColor="bg-blue-500/10 border-blue-500/20 text-blue-200"
              />
              <PlayerList
                title="Non-inscrits (Absents)"
                players={unregistered}
                icon={UserMinus}
                color="text-zinc-400"
                borderColor="border-zinc-500/20"
                bgColor="bg-zinc-500/10 border-zinc-500/20 text-zinc-300"
              />
              <PlayerList
                title="Absents (No-Shows)"
                players={absentRegisteredPresent}
                icon={UserX}
                color="text-red-400"
                borderColor="border-red-500/20"
                bgColor="bg-red-500/10 border-red-500/20 text-red-200"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;