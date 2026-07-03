import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

function getMonday(d: Date) {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setHours(0,0,0,0);
  monday.setDate(d.getDate() + diff);
  return monday;
}

function formatWeekLabel(start: Date) {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.toLocaleDateString('fr-FR')} → ${end.toLocaleDateString('fr-FR')}`;
}

const WeeklyStats = () => {
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [scans, setScans] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data: scansData, error: scansErr } = await supabase
          .from("raid_events_stats")
          .select("*")
          .order("scan_timestamp", { ascending: false });
        if (scansErr) throw scansErr;
        setScans(scansData || []);

        const { data: playersData, error: playersErr } = await supabase.from("players").select("*");
        if (playersErr) throw playersErr;
        setPlayers(playersData || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setHours(23,59,59,999);
    d.setDate(weekStart.getDate() + 6);
    return d;
  }, [weekStart]);

  const filteredScans = useMemo(() => scans.filter(s => {
    const ts = new Date(s.scan_timestamp);
    return ts >= weekStart && ts <= weekEnd;
  }), [scans, weekStart, weekEnd]);

  const normalize = (s: any) => String(s || '').toLowerCase().replace(/\s+/g,' ').trim();
  const getKey = (p: any) => {
    if (p.discord_id) return `id:${p.discord_id}`;
    const name = p.idv ? p.idv : (p.name || p.discord_name || p.userid || p.id);
    return `name:${normalize(name)}`;
  };

  const statsByPlayer = useMemo(() => {
    const map: Record<string, { name: string; registrationCount: number; attendanceCount: number }> = {};

    // Seed from DB players (use discord_id when available, else normalized name)
    players.forEach(p => {
      const key = p.id || p.discord_id ? (p.discord_id ? `id:${p.discord_id}` : `id:${p.id}`) : `name:${normalize(p.discord_name)}`;
      if (!map[key]) map[key] = { name: p.discord_name || p.id, registrationCount: 0, attendanceCount: 0 };
    });

    // Ensure any player appearing in scans is included, deduping by discord_id or normalized name
    filteredScans.forEach(scan => {
      const allLists = [
        ...(scan.players_present_registered || []),
        ...(scan.players_absent_registered_absent || []),
        ...(scan.players_absent_registered_present || []),
        ...(scan.players_present_unregistered_or_absent || []),
        ...(scan.players_unregistered || [])
      ];
      allLists.forEach((p: any) => {
        const key = p.discord_id ? `id:${p.discord_id}` : `name:${normalize(p.name || p.discord_name || p.userid || p.id)}`;
        if (!map[key]) map[key] = { name: p.name || p.discord_name || key, registrationCount: 0, attendanceCount: 0 };
      });
    });

    // Count occurrences using same key strategy
    filteredScans.forEach(scan => {
      const presentRegistered = scan.players_present_registered || [];
      const presentUnreg = scan.players_present_unregistered_or_absent || [];
      const regAbsent = scan.players_absent_registered_absent || [];
      const regNoShow = scan.players_absent_registered_present || [];

      presentRegistered.forEach((p: any) => {
        const key = p.discord_id ? `id:${p.discord_id}` : `name:${normalize(p.name || p.discord_name || p.userid || p.id)}`;
        map[key].attendanceCount += 1;
        map[key].registrationCount += 1;
      });
      presentUnreg.forEach((p: any) => {
        const key = p.discord_id ? `id:${p.discord_id}` : `name:${normalize(p.name || p.discord_name || p.userid || p.id)}`;
        map[key].attendanceCount += 1;
      });
      regAbsent.forEach((p: any) => {
        const key = p.discord_id ? `id:${p.discord_id}` : `name:${normalize(p.name || p.discord_name || p.userid || p.id)}`;
        map[key].registrationCount += 1;
      });
      regNoShow.forEach((p: any) => {
        const key = p.discord_id ? `id:${p.discord_id}` : `name:${normalize(p.name || p.discord_name || p.userid || p.id)}`;
        map[key].registrationCount += 1;
      });
    });
    
    return map;
  }, [filteredScans, players]);

  const rows = useMemo(() => Object.entries(statsByPlayer).map(([id, v]) => ({ id, ...v, percent: v.registrationCount > 0 ? Math.round((v.attendanceCount / v.registrationCount) * 100) : (v.attendanceCount > 0 ? 100 : 0) })).sort((a,b)=> b.attendanceCount - a.attendanceCount), [statsByPlayer]);

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(getMonday(d)); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(getMonday(d)); };

  if (loading) return <div className="text-zinc-400">Chargement...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={prevWeek}>Précédente</Button>
          <div className="text-sm font-bold">{formatWeekLabel(weekStart)}</div>
          <Button variant="ghost" onClick={nextWeek}>Suivante</Button>
        </div>
        <div className="text-xs text-zinc-400">{filteredScans.length} événements cette semaine</div>
      </div>

      <div className="bg-[#1e1333]/30 rounded-2xl p-4">
        <div className="grid grid-cols-12 gap-2 text-xs font-black uppercase text-zinc-400 pb-2 border-b border-white/5 mb-2">
          <div className="col-span-5">Joueur</div>
          <div className="col-span-2 text-center">Inscriptions</div>
          <div className="col-span-2 text-center">Présences</div>
          <div className="col-span-2 text-center">Taux</div>
          <div className="col-span-1 text-center">Etat</div>
        </div>

        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
          {rows.map(r => (
            <div key={r.id} className={`grid grid-cols-12 gap-2 p-2 rounded-lg items-center ${r.registrationCount === 0 ? 'border-l-4 border-red-500 bg-red-600/5' : r.attendanceCount === 0 ? 'border-l-4 border-yellow-500 bg-yellow-600/5' : 'border-l-4 border-emerald-500 bg-black/20'}`}>
              <div className="col-span-5 truncate font-medium">{r.name}</div>
              <div className="col-span-2 text-center">{r.registrationCount}</div>
              <div className="col-span-2 text-center">{r.attendanceCount}</div>
              <div className="col-span-2 text-center text-sm font-bold">{r.registrationCount === 0 ? (r.attendanceCount > 0 ? '—' : '0%') : `${r.percent}%`}</div>
              <div className="col-span-1 text-center text-xs font-semibold">
                {r.registrationCount === 0 ? <span className="text-red-400">Non inscrit</span>
                : r.attendanceCount === 0 ? <span className="text-yellow-400">Jamais venu</span>
                : <span className="text-emerald-400">Présent</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyStats;
