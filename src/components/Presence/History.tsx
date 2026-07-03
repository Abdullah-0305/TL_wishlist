import React, { useState, useEffect, useMemo } from "react";
import { Calendar, Clock, Users, ChevronDown, ChevronUp, UserCheck, UserX, UserMinus, UserCog, UserPlus, Trash2, Edit2, Save, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StatRecord {
  id: string;
  name: string;
  discord_id: string;
  class?: string;
  spec?: string;
}

interface RaidEventStat {
  id: string;
  event_id: string;
  event_name: string;
  event_date: string;
  scan_timestamp: string;
  players_present_registered: StatRecord[];
  players_present_unregistered_or_absent: StatRecord[];
  players_absent_registered_absent: StatRecord[];
  players_unregistered: StatRecord[];
  players_absent_registered_present: StatRecord[];
}

type ListKey = 
  | "players_present_registered"
  | "players_present_unregistered_or_absent"
  | "players_absent_registered_absent"
  | "players_unregistered"
  | "players_absent_registered_present";

const CATEGORIES: { key: ListKey; title: string; icon: any; color: string; border: string }[] = [
  { key: "players_present_registered", title: "Présents & Inscrits", icon: UserCheck, color: "text-emerald-400", border: "border-emerald-500/20" },
  { key: "players_present_unregistered_or_absent", title: "Présents (Imprévus)", icon: UserPlus, color: "text-amber-400", border: "border-amber-500/20" },
  { key: "players_absent_registered_absent", title: "Absents (Excusés)", icon: UserCog, color: "text-blue-400", border: "border-blue-500/20" },
  { key: "players_unregistered", title: "Non-inscrits", icon: UserMinus, color: "text-zinc-400", border: "border-zinc-500/20" },
  { key: "players_absent_registered_present", title: "Absents (No-Shows)", icon: UserX, color: "text-red-400", border: "border-red-500/20" }
];

const ScanHistory = () => {
  const [scans, setScans] = useState<RaidEventStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // États pour le Drag & Drop
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftScan, setDraftScan] = useState<RaidEventStat | null>(null);
  const [dragOverList, setDragOverList] = useState<ListKey | null>(null);

  // Semaine (lundi -> dimanche)
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay(); // 0 = dimanche
    const diff = day === 0 ? -6 : 1 - day; // régler au lundi
    const monday = new Date(now);
    monday.setHours(0,0,0,0);
    monday.setDate(now.getDate() + diff);
    return monday;
  });

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setHours(23,59,59,999);
    d.setDate(weekStart.getDate() + 6);
    return d;
  }, [weekStart]);

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };

  const filteredScans = useMemo(() => scans.filter(s => {
    const ts = new Date(s.scan_timestamp);
    return ts >= weekStart && ts <= weekEnd;
  }), [scans, weekStart, weekEnd]);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("raid_events_stats")
        .select("*")
        .order("scan_timestamp", { ascending: false });

      if (error) throw error;
      setScans(data || []);
    } catch (error) {
      console.error("Erreur historique :", error);
      toast.error("Impossible de charger l'historique.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const toggleExpand = (id: string) => {
    if (editingId) {
      toast.error("Veuillez sauvegarder ou annuler vos modifications d'abord.");
      return;
    }
    setExpandedId(expandedId === id ? null : id);
  };

  // --- LOGIQUE D'ÉDITION ET DRAG & DROP ---

  const startEditing = (scan: RaidEventStat) => {
    setEditingId(scan.id);
    // On fait une copie profonde pour ne pas muter l'état principal pendant l'édition
    setDraftScan(JSON.parse(JSON.stringify(scan)));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftScan(null);
  };

  const saveEditing = async () => {
    if (!draftScan) return;
    const toastId = toast.loading("Sauvegarde en cours...");

    try {
      const { id, ...updatePayload } = draftScan;
      const { error } = await supabase
        .from("raid_events_stats")
        .update(updatePayload)
        .eq("id", id);

      if (error) throw error;

      // Mise à jour de l'UI localement
      setScans(scans.map(s => (s.id === id ? draftScan : s)));
      setEditingId(null);
      setDraftScan(null);
      
      toast.success("Modifications validées avec succès !", { id: toastId });
    } catch (error) {
      console.error("Erreur update :", error);
      toast.error("Erreur lors de la sauvegarde.", { id: toastId });
    }
  };

  const handleDragStart = (e: React.DragEvent, playerId: string, sourceList: ListKey) => {
    e.dataTransfer.setData("playerId", playerId);
    e.dataTransfer.setData("sourceList", sourceList);
  };

  const handleDragOver = (e: React.DragEvent, targetList: ListKey) => {
    e.preventDefault(); // Nécessaire pour autoriser le drop
    setDragOverList(targetList);
  };

  const handleDragLeave = () => {
    setDragOverList(null);
  };

  const handleDrop = (e: React.DragEvent, targetList: ListKey) => {
    e.preventDefault();
    setDragOverList(null);
    
    const playerId = e.dataTransfer.getData("playerId");
    const sourceList = e.dataTransfer.getData("sourceList") as ListKey;

    if (sourceList === targetList || !draftScan) return;

    setDraftScan(prev => {
      if (!prev) return prev;
      
      const sourceArray = [...prev[sourceList]];
      const targetArray = [...prev[targetList]];
      
      const playerIndex = sourceArray.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return prev;

      // Retirer de la source et ajouter à la cible
      const [movedPlayer] = sourceArray.splice(playerIndex, 1);
      targetArray.push(movedPlayer);

      return {
        ...prev,
        [sourceList]: sourceArray,
        [targetList]: targetArray
      };
    });
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Es-tu sûr de vouloir supprimer ce scan ?")) return;

    try {
      const { error } = await supabase.from("raid_events_stats").delete().eq("id", id);
      if (error) throw error;
      setScans(scans.filter(scan => scan.id !== id));
      toast.success("Scan supprimé avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  if (loading) {
    return <div className="text-zinc-500 animate-pulse text-sm font-bold tracking-widest uppercase py-10 text-center">Chargement de l'historique...</div>;
  }

  if (scans.length === 0) {
    return <div className="text-zinc-500 italic py-10 text-center bg-[#1e1333]/30 border border-white/5 rounded-2xl">Aucun scan enregistré pour le moment.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-cyan-500" />
        Historique des Scans
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 text-sm" onClick={prevWeek}>Précédente</Button>
            <div className="text-sm font-bold px-3">{weekStart.toLocaleDateString('fr-FR')} → {new Date(weekEnd).toLocaleDateString('fr-FR')}</div>
            <Button variant="ghost" size="sm" className="px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 text-sm" onClick={nextWeek}>Suivante</Button>
          </div>
          <div className="text-xs text-zinc-400">{filteredScans.length} événements cette semaine</div>
        </div>

        {filteredScans.map((scan) => {
          const isExpanded = expandedId === scan.id;
          const isEditing = editingId === scan.id;
          
          // Si on édite, on affiche les données du brouillon, sinon les données réelles
          const displayScan = isEditing && draftScan ? draftScan : scan;
          const totalPresent = (displayScan.players_present_registered?.length || 0) + (displayScan.players_present_unregistered_or_absent?.length || 0);

          return (
            <div 
              key={scan.id} 
              className={cn(
                "bg-[#1e1333]/40 border rounded-2xl overflow-hidden transition-all duration-300",
                isExpanded ? "border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]" : "border-white/5 hover:border-white/20 cursor-pointer"
              )}
            >
              {/* EN-TÊTE DU SCAN */}
              <div 
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                onClick={() => toggleExpand(scan.id)}
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {displayScan.event_name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-medium tracking-wide">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(displayScan.event_date).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}</span>
                     <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(displayScan.scan_timestamp).toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit' })} (Europe/Paris)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                    <Users className="h-3 w-3" /> {totalPresent} Présents
                  </span>
                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                    <UserX className="h-3 w-3" /> {displayScan.players_absent_registered_present?.length || 0} No-Shows
                  </span>
                  
                  {!isEditing && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="ml-2 hover:bg-white/5 text-zinc-400 hover:text-white h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); toggleExpand(scan.id); }}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>

              {/* DÉTAILS ET DRAG & DROP */}
              {isExpanded && (
                <div className="p-5 bg-black/40 border-t border-white/5 space-y-6 animate-in slide-in-from-top-2 duration-300">
                  
                  {isEditing && (
                    <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2">
                      <Edit2 className="h-4 w-4" /> Mode Édition actif : Glisse et dépose les joueurs pour corriger les listes.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-stretch">
                    {CATEGORIES.map((cat) => {
                      const players = displayScan[cat.key] || [];
                      const isDragOver = dragOverList === cat.key;

                      return (
                        <div 
                          key={cat.key}
                          onDragOver={(e) => isEditing ? handleDragOver(e, cat.key) : undefined}
                          onDragLeave={isEditing ? handleDragLeave : undefined}
                          onDrop={(e) => isEditing ? handleDrop(e, cat.key) : undefined}
                          className={cn(
                            "bg-[#1e1333]/50 border rounded-xl p-3 flex flex-col transition-all duration-200",
                            cat.border,
                            isDragOver && isEditing ? "bg-white/10 scale-[1.02] border-white/50 border-dashed" : "",
                            isEditing ? "min-h-[150px]" : ""
                          )}
                        >
                          <h4 className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b pb-2 mb-2", cat.color, cat.border)}>
                            <cat.icon className="h-3 w-3" /> {cat.title} ({players.length})
                          </h4>
                          
                          <div className="flex-1 space-y-1.5 flex flex-col">
                            {players.length === 0 ? (
                              <span className="text-xs text-zinc-600 italic py-2">Vide</span>
                            ) : (
                              players.map((p) => (
                                <div 
                                  key={p.id} 
                                  draggable={isEditing}
                                  onDragStart={(e) => isEditing ? handleDragStart(e, p.id, cat.key) : undefined}
                                  className={cn(
                                    "text-xs bg-black/40 border border-white/5 px-2 py-1.5 rounded flex justify-between items-center transition-colors",
                                    isEditing ? "cursor-grab active:cursor-grabbing hover:bg-white/10 hover:border-white/20" : ""
                                  )}
                                >
                                  <span className="truncate pr-2 font-medium">{p.name}</span>
                                  {p.class && <span className="text-[9px] opacity-50">{p.class}</span>}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* ACTIONS BOUTONS */}
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    {isEditing ? (
                      <>
                        <Button 
                          variant="ghost" 
                          className="text-zinc-400 hover:text-white hover:bg-white/5"
                          onClick={cancelEditing}
                        >
                          <X className="h-4 w-4 mr-2" /> Annuler
                        </Button>
                        <Button 
                          className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          onClick={saveEditing}
                        >
                          <Save className="h-4 w-4 mr-2" /> Valider les modifications
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20"
                          onClick={(e) => handleDelete(scan.id, e)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white border border-cyan-500/30"
                          onClick={() => startEditing(scan)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" /> Éditer le scan
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScanHistory;