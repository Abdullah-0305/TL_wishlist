import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { UserCheck, UserX, UserMinus, Search, RefreshCw, Scan } from "lucide-react";
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

const Attendance = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [eventId, setEventId] = useState("");

  const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([]);
  const [rhSignups, setRhSignups] = useState<RHSignup[]>([]);

  const goodBoys = rhSignups.filter(rh =>
    onlinePlayers.some(p => p.discord_id === rh.userid)
  );
  const noShows = rhSignups.filter(rh =>
    !onlinePlayers.some(p => p.discord_id === rh.userid)
  );
  const unregisteredButPresent = onlinePlayers.filter(p =>
    !rhSignups.some(rh => rh.userid === p.discord_id)
  );

  const getRHSignups = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("raid-helper", {
        body: { eventId: id },
      });
      if (error) throw error;

      return data.signups;
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la récupération des inscrits RH");
      return [];
    }
  };

  const saveStatsToDatabase = async (id: string, eventName: string) => {
    try {
      const presentRegistered: StatRecord[] = goodBoys.map(p => ({
        id: p.userid,
        name: p.name,
        discord_id: p.userid,
        class: p.className,
        spec: p.specName,
      }));

      const absent: StatRecord[] = noShows.map(p => ({
        id: p.userid,
        name: p.name,
        discord_id: p.userid,
        class: p.className,
        spec: p.specName,
      }));

      const pickup: StatRecord[] = unregisteredButPresent.map(p => ({
        id: p.id,
        name: p.discord_name,
        discord_id: p.discord_id,
      }));

      const { error } = await supabase.from("raid_events_stats").insert({
        event_id: id,
        event_name: eventName,
        event_date: new Date().toISOString().split("T")[0],
        scan_timestamp: new Date().toISOString(),
        players_present_registered: presentRegistered,
        players_absent: absent,
        players_pickup: pickup,
      });

      if (error) throw error;
      toast.success("Stats enregistrées avec succès !");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement des stats");
    }
  };

  const handleScan = async () => {
    if (!eventId.trim()) {
      toast.error("Veuillez entrer un ID d'event");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Scan en cours...");

    try {
      // 1. Récupérer les inscrits RH
      const signups = await getRHSignups(eventId);
      setRhSignups(signups);

      // 2. Récupérer les joueurs en vocal
      const { data: dbPlayers, error: dbError } = await supabase
        .from("players")
        .select("*")
        .eq("is_online", true);

      if (dbError) throw dbError;
      setOnlinePlayers(dbPlayers || []);

      // 3. Enregistrer dans la BD
      await saveStatsToDatabase(eventId, `Event ${eventId}`);

      setLastScan(new Date());
      toast.success("Scan terminé avec succès !", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du scan", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, count, icon: Icon, color, bg }: any) => (
    <div
      className={cn(
        "p-6 rounded-2xl border shadow-lg relative overflow-hidden group transition-all",
        bg,
        color
      )}
    >
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
            {title}
          </span>
          <p className="text-4xl font-black">{count}</p>
        </div>
        <div className="p-3 bg-black/20 rounded-xl backdrop-blur-md">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  const PlayerList = ({
    title,
    players,
    icon: Icon,
    color,
    borderColor,
    bgColor,
  }: any) => (
    <div className={cn("bg-[#1e1333]/50 border rounded-2xl p-4", borderColor)}>
      <h3
        className={cn(
          "font-black uppercase tracking-widest text-xs mb-4 border-b pb-2",
          color,
          borderColor
        )}
      >
        {title} ({players.length})
      </h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {players.length === 0 ? (
          <div className="text-xs text-zinc-500 italic p-2">Aucun</div>
        ) : (
          players.map((player: any) => (
            <div
              key={player.userid || player.id}
              className={cn(
                "p-2.5 rounded-lg text-sm font-semibold border",
                bgColor
              )}
            >
              <div className="flex justify-between items-center">
                <span>{player.name || player.discord_name}</span>
                {player.className && (
                  <span className="text-[10px] text-zinc-400">
                    {player.className}
                    {player.specName && ` • ${player.specName}`}
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
      <div className="max-w-7xl mx-auto space-y-8">
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

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="Event ID"
              className="px-4 h-12 bg-zinc-900 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
              onKeyPress={(e) => e.key === "Enter" && handleScan()}
            />
            <Button
              onClick={handleScan}
              disabled={loading || !eventId.trim()}
              className="h-12 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Scan className="h-5 w-5 mr-2" />
                  Scan
                </>
              )}
            </Button>
          </div>
        </div>

        {/* RÉSULTATS */}
        {lastScan && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* INFO SCAN */}
            <div className="flex flex-col gap-2 text-xs text-zinc-500 font-bold uppercase tracking-widest">
              <span>Dernier scan : {lastScan.toLocaleTimeString()}</span>
              <span>Event ID : {eventId}</span>
              <span>
                Inscrits RH : {rhSignups.length} | En vocal : {onlinePlayers.length}
              </span>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Présents & Inscrits"
                count={goodBoys.length}
                icon={UserCheck}
                bg="bg-emerald-500/10 border-emerald-500/30"
                color="text-emerald-400"
              />
              <StatCard
                title="No-Shows"
                count={noShows.length}
                icon={UserX}
                bg="bg-red-500/10 border-red-500/30"
                color="text-red-400"
              />
              <StatCard
                title="Pick-ups"
                count={unregisteredButPresent.length}
                icon={UserMinus}
                bg="bg-amber-500/10 border-amber-500/30"
                color="text-amber-400"
              />
            </div>

            {/* LISTES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PlayerList
                title="✅ Valides"
                players={goodBoys}
                icon={UserCheck}
                color="text-emerald-400"
                borderColor="border-emerald-500/20"
                bgColor="bg-black/40 border-white/5"
              />
              <PlayerList
                title="❌ No-Shows"
                players={noShows}
                icon={UserX}
                color="text-red-400"
                borderColor="border-red-500/20"
                bgColor="bg-red-500/10 border-red-500/20 text-red-200"
              />
              <PlayerList
                title="⚠️ Pickups"
                players={unregisteredButPresent}
                icon={UserMinus}
                color="text-amber-400"
                borderColor="border-amber-500/20"
                bgColor="bg-amber-500/10 border-amber-500/20 text-amber-200"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
