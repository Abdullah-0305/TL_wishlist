import React, { useState, useMemo } from "react";
import { UserCheck, UserX, UserMinus, RefreshCw, Scan, UserCog, UserPlus, Zap } from "lucide-react";
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

const Scanner = () => {
  const [loading, setLoading] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [eventId, setEventId] = useState("");
  const [eventName, setEventName] = useState("");

  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [rhSignups, setRhSignups] = useState<RHSignup[]>([]);

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

      const { data: existingEvents, error: fetchError } = await supabase
        .from("raid_events_stats")
        .select("id")
        .eq("event_id", id);

      if (fetchError) throw fetchError;

      const isUpdate = existingEvents && existingEvents.length > 0;

      if (isUpdate) {
        const { error: deleteError } = await supabase
          .from("raid_events_stats")
          .delete()
          .eq("event_id", id);

        if (deleteError) throw deleteError;
      }

      const { error: insertError } = await supabase
        .from("raid_events_stats")
        .insert(payload);

      if (insertError) throw insertError;
      
      toast.success(isUpdate ? "Stats mises à jour avec succès !" : "Stats enregistrées avec succès !");
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
      const { signups, title } = await getRHSignups(currentEventId);
      
      const { data: dbPlayers, error: dbError } = await supabase.from("players").select("*");
      if (dbError) throw dbError;

      const freshPlayers = dbPlayers || [];
      const freshLists = calculateLists(signups, freshPlayers);

      await saveStatsToDatabase(currentEventId, title, freshLists);
      
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
    <div className="space-y-8">
      {/* BOUTONS D'ACTION */}
      <div className="flex items-center justify-end gap-4">
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

      {/* RÉSULTATS */}
      {lastScan && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 font-bold uppercase tracking-widest">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              {eventName}
            </span>
            <span className="bg-white/5 px-3 py-1.5 rounded-full">Dernier scan : {lastScan.toLocaleTimeString()}</span>
            <span className="bg-white/5 px-3 py-1.5 rounded-full">Event ID : {eventId}</span>
            <span className="bg-white/5 px-3 py-1.5 rounded-full">Inscrits RH : {rhSignups.length} | DB : {allPlayers.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatCard title="Présent & Inscrit" count={presentRegistered.length} icon={UserCheck} bg="bg-emerald-500/10 border-emerald-500/30" color="text-emerald-400" />
            <StatCard title="Présent + Imprévu" count={presentUnregisteredOrAbsent.length} icon={UserPlus} bg="bg-amber-500/10 border-amber-500/30" color="text-amber-400" />
            <StatCard title="Absent & Excusé" count={absentRegisteredAbsent.length} icon={UserCog} bg="bg-blue-500/10 border-blue-500/30" color="text-blue-400" />
            <StatCard title="Non-inscrit (Fantôme)" count={unregistered.length} icon={UserMinus} bg="bg-zinc-500/10 border-zinc-500/30" color="text-zinc-400" />
            <StatCard title="Absent & Inscrit (No-Show)" count={absentRegisteredPresent.length} icon={UserX} bg="bg-red-500/10 border-red-500/30" color="text-red-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-stretch">
            <PlayerList title="Présents & Inscrits" players={presentRegistered} icon={UserCheck} color="text-emerald-400" borderColor="border-emerald-500/20" bgColor="bg-emerald-500/10 border-emerald-500/20 text-emerald-200" />
            <PlayerList title="Présents (Non-insc/Abs)" players={presentUnregisteredOrAbsent} icon={UserPlus} color="text-amber-400" borderColor="border-amber-500/20" bgColor="bg-amber-500/10 border-amber-500/20 text-amber-200" />
            <PlayerList title="Absents (Inscrits Abs)" players={absentRegisteredAbsent} icon={UserCog} color="text-blue-400" borderColor="border-blue-500/20" bgColor="bg-blue-500/10 border-blue-500/20 text-blue-200" />
            <PlayerList title="Non-inscrits (Absents)" players={unregistered} icon={UserMinus} color="text-zinc-400" borderColor="border-zinc-500/20" bgColor="bg-zinc-500/10 border-zinc-500/20 text-zinc-300" />
            <PlayerList title="Absents (No-Shows)" players={absentRegisteredPresent} icon={UserX} color="text-red-400" borderColor="border-red-500/20" bgColor="bg-red-500/10 border-red-500/20 text-red-200" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;