import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { Settings as SettingsIcon, Swords, Shield, Gem, Skull, Ghost, Plus, Pencil, Trash2, ToggleRight, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getTableItems, saveItemWithBosses, deleteTableItem, getAppSettings, toggleSetting } from "@/api/db";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface SettingItem {
  id: string;
  name: { fr: string; en: string };
  idBoss?: number; 
}

interface AppSetting {
  id: string;
  is_active: boolean;
}

type TabType = "general" | "boss" | "armes" | "armures" | "accessoires" | "archboss";

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] as "fr" | "en" || "fr";
  
  // Onglet Général par défaut
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [items, setItems] = useState<SettingItem[]>([]);
  const [bosses, setBosses] = useState<SettingItem[]>([]);
  const [appSettings, setAppSettings] = useState<AppSetting[]>([]);
  const [relations, setRelations] = useState<{armures: any[], accessoires: any[]}>({armures: [], accessoires: []});
  const [loading, setLoading] = useState(true);

  // States de la modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameFr, setNameFr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [selectedBosses, setSelectedBosses] = useState<string[]>([]);

  // Configuration des onglets
  const tabs = [
    { 
      id: "general", label: t("settings.tab_general", "Général"), icon: ToggleRight,
      activeClass: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30 shadow-[0_0_15px_rgba(161,161,170,0.15)] hover:bg-zinc-500/25 hover:text-zinc-200",
      inactiveClass: "border-transparent text-zinc-400 hover:bg-zinc-500/10 hover:text-zinc-300",
      titleColor: "text-zinc-400"
    },
    { 
      id: "boss", label: t("settings.tab_boss", "Boss"), icon: Ghost,
      activeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-emerald-500/25 hover:text-emerald-200",
      inactiveClass: "border-transparent text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-300",
      titleColor: "text-emerald-400"
    },
    { 
      id: "armes", label: t("settings.tab_weapons", "Armes"), icon: Swords,
      activeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:bg-amber-500/25 hover:text-amber-200",
      inactiveClass: "border-transparent text-zinc-400 hover:bg-amber-500/10 hover:text-amber-300",
      titleColor: "text-amber-400"
    },
    { 
      id: "armures", label: t("settings.tab_armors", "Armures"), icon: Shield,
      activeClass: "bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:bg-blue-500/25 hover:text-blue-200",
      inactiveClass: "border-transparent text-zinc-400 hover:bg-blue-500/10 hover:text-blue-300",
      titleColor: "text-blue-400"
    },
    { 
      id: "accessoires", label: t("settings.tab_accessories", "Accessoires"), icon: Gem,
      activeClass: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.15)] hover:bg-fuchsia-500/25 hover:text-fuchsia-200",
      inactiveClass: "border-transparent text-zinc-400 hover:bg-fuchsia-500/10 hover:text-fuchsia-300",
      titleColor: "text-fuchsia-400"
    },
    { 
      id: "archboss", label: t("settings.tab_archboss", "Archboss"), icon: Skull,
      activeClass: "bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)] hover:bg-rose-500/25 hover:text-rose-200",
      inactiveClass: "border-transparent text-zinc-400 hover:bg-rose-500/10 hover:text-rose-300",
      titleColor: "text-rose-500"
    },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === "general") {
        const settings = await getAppSettings();
        setAppSettings(settings as AppSetting[]);
      } else {
        const [data, bossData, armuresBoss, accBoss] = await Promise.all([
          getTableItems(activeTab),
          getTableItems("boss"),
          supabase.from("armures_boss").select("*"),
          supabase.from("accessoires_boss").select("*")
        ]);
        setItems(data as SettingItem[]);
        setBosses(bossData as SettingItem[]);
        setRelations({ armures: armuresBoss.data || [], accessoires: accBoss.data || [] });
      }
    } catch (error) {
      console.error(error);
      toast.error(t("settings.error_load", "Erreur lors du chargement des données."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Handler pour changer un réglage (On/Off)
  const handleToggleSetting = async (id: string, currentValue: boolean) => {
    try {
      await toggleSetting(id, !currentValue);
      // Met à jour l'UI instantanément pour la fluidité
      setAppSettings(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentValue } : s));
      toast.success(t("settings.toggle_success", "Réglage mis à jour."));
    } catch (error) {
      toast.error(t("settings.toggle_error", "Erreur lors de la mise à jour."));
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setNameFr("");
    setNameEn("");
    setSelectedBosses([]);
    setIsModalOpen(true);
  };

  const openEditModal = (item: SettingItem) => {
    setEditingId(item.id);
    setNameFr(item.name.fr || "");
    setNameEn(item.name.en || "");

    if (activeTab === "armes" || activeTab === "archboss") {
      setSelectedBosses(item.idBoss ? [item.idBoss.toString()] : []);
    } else if (activeTab === "armures") {
      const b = relations.armures.filter(r => r.idArmure == item.id).map(r => r.idBoss.toString());
      setSelectedBosses(b);
    } else if (activeTab === "accessoires") {
      const b = relations.accessoires.filter(r => r.idAccessoire == item.id).map(r => r.idBoss.toString());
      setSelectedBosses(b);
    } else {
      setSelectedBosses([]);
    }
    
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!nameFr.trim() || !nameEn.trim()) {
      toast.error(t("settings.error_names_required", "Les deux noms (FR et EN) sont obligatoires."));
      return;
    }
    const toastId = toast.loading(t("settings.saving", "Sauvegarde en cours..."));
    try {
      await saveItemWithBosses(activeTab, editingId, nameFr, nameEn, selectedBosses);
      toast.success(t("settings.save_success", "Élément sauvegardé avec succès !"), { id: toastId });
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error(t("settings.save_error", "Erreur lors de la sauvegarde."), { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("settings.delete_confirm", "Êtes-vous sûr de vouloir supprimer cet élément ? Cela peut casser les wishlists des joueurs liés !"))) return;
    
    const toastId = toast.loading(t("settings.deleting", "Suppression en cours..."));
    try {
      await deleteTableItem(activeTab, id);
      toast.success(t("settings.delete_success", "Élément supprimé."), { id: toastId });
      loadData();
    } catch (error) {
      toast.error(t("settings.delete_error", "Erreur lors de la suppression."), { id: toastId });
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  const currentTabConfig = tabs.find(t => t.id === activeTab);
  const isSingleBoss = activeTab === "armes" || activeTab === "archboss";

  return (
    <div className="min-h-screen bg-[#0a0b10] bg-[radial-gradient(ellipse_at_top,_rgba(88,28,135,0.15)_0%,_rgba(10,11,16,1)_80%)] text-zinc-100 pb-20">
      <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-10 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-fuchsia-500/20 pb-6 mb-6">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter bg-gradient-to-r from-fuchsia-400 to-gaming-gold bg-clip-text text-transparent drop-shadow-sm flex items-center gap-3">
              <SettingsIcon className="h-10 w-10 text-fuchsia-500" />
              {t("settings.title", "Paramètres")}
            </h1>
            <p className="text-fuchsia-400/60 font-medium flex items-center gap-2 text-sm md:text-base">
              <span className="w-8 h-[1px] bg-gaming-gold/30 hidden sm:block"></span>
              {t("settings.subtitle", "Gestion des listes de la base de données")}
            </p>
          </div>
        </div>

        {/* ONGLETS */}
        <div className="flex flex-wrap sm:flex-nowrap space-y-2 sm:space-y-0 sm:space-x-2 bg-[#1e1333]/60 p-1.5 rounded-xl border border-white/5 shadow-inner w-full md:w-fit mb-8">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 md:flex-none gap-2 px-6 h-10 transition-all border ${
                activeTab === tab.id ? tab.activeClass : tab.inactiveClass
              }`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </Button>
          ))}
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="relative">
          <div className="absolute -inset-10 bg-fuchsia-600/5 blur-[120px] pointer-events-none opacity-50" />
          
          {/* ONGLET GÉNÉRAL (Feature Flags) */}
          {activeTab === "general" && (
             <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
               <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
                  <h2 className={cn("text-lg font-black uppercase tracking-widest flex items-center gap-2", currentTabConfig?.titleColor)}>
                    {currentTabConfig && <currentTabConfig.icon className="h-5 w-5" />}
                    {t("settings.global_settings", "Réglages Globaux")}
                  </h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {appSettings.map((setting) => {
                   // Mapping dynamique pour avoir de beaux textes et couleurs selon l'ID
                   const isArchboss = setting.id === 'enable_archboss';
                   const title = isArchboss ? t("settings.archboss_event", "Événement Archboss") : setting.id;
                   const desc = isArchboss ? t("settings.archboss_desc", "Affiche l'onglet dans la Wishlist et l'Admin") : "";
                   
                   const Icon = isArchboss ? Skull : Power;
                   const activeColor = isArchboss ? "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]" : "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]";
                   const cardBorder = setting.is_active ? (isArchboss ? "border-rose-500/50" : "border-emerald-500/50") : "border-white/5";
                   const iconColor = setting.is_active ? (isArchboss ? "text-rose-400" : "text-emerald-400") : "text-zinc-500";
                   const iconBg = setting.is_active ? (isArchboss ? "bg-rose-500/10" : "bg-emerald-500/10") : "bg-white/5";

                   return (
                     <div 
                       key={setting.id} 
                       className={cn(
                         "flex flex-col justify-between p-6 rounded-2xl bg-black/40 border transition-all duration-300 relative overflow-hidden group",
                         cardBorder
                       )}
                     >
                        {/* Lueur de fond si actif */}
                        {setting.is_active && (
                          <div className={cn(
                            "absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-20 pointer-events-none transition-all duration-500",
                            isArchboss ? "bg-rose-500" : "bg-emerald-500"
                          )} />
                        )}

                        <div className="flex items-start justify-between mb-6 relative z-10">
                          <div className={cn("p-3 rounded-xl transition-colors duration-300", iconBg)}>
                            <Icon className={cn("h-6 w-6 transition-colors duration-300", iconColor)} />
                          </div>
                          <button 
                            onClick={() => handleToggleSetting(setting.id, setting.is_active)}
                            className={cn(
                              "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none",
                              setting.is_active ? activeColor : "bg-zinc-700/80"
                            )}
                          >
                            <span
                              className={cn(
                                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out",
                                setting.is_active ? "translate-x-5" : "translate-x-0.5"
                              )}
                            />
                          </button>
                        </div>

                        <div className="flex flex-col gap-1.5 relative z-10">
                          <span className={cn(
                            "font-black uppercase tracking-widest text-sm transition-colors duration-300",
                            setting.is_active ? "text-white" : "text-zinc-400"
                          )}>
                            {title}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                            {desc}
                          </span>
                        </div>
                     </div>
                   );
                 })}
               </div>
             </div>
          )}

          {/* AUTRES ONGLETS (Listes d'items) */}
          {activeTab !== "general" && (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
                <h2 className={cn("text-lg font-black uppercase tracking-widest flex items-center gap-2", currentTabConfig?.titleColor)}>
                  {currentTabConfig && <currentTabConfig.icon className="h-5 w-5" />}
                  {t("settings.list_of", "Liste des")} {currentTabConfig?.label}
                </h2>
                <Button onClick={openAddModal} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-xs">
                  <Plus className="h-4 w-4 mr-2" /> {t("settings.add_btn", "Ajouter")}
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-20 text-zinc-500 italic text-sm border border-dashed border-white/10 rounded-xl bg-black/20">
                  {t("settings.no_items", "Aucun élément trouvé.")}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 p-4 rounded-xl bg-black/40 border border-white/5 relative group hover:border-fuchsia-500/30 transition-all shadow-xl">
                      <div className="flex-grow">
                        <div className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400/50 mb-1">
                          {t("settings.name_fr", "Français")}
                        </div>
                        <div className="text-sm font-bold text-white mb-3 truncate">{item.name.fr}</div>
                        
                        <div className="text-[10px] font-black uppercase tracking-widest text-gaming-gold/50 mb-1">
                          {t("settings.name_en", "Anglais")}
                        </div>
                        <div className="text-sm font-bold text-zinc-300 truncate">{item.name.en}</div>
                      </div>
                      
                      <div className="flex gap-2 mt-2 pt-3 border-t border-white/5">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(item)} className="flex-1 bg-white/5 hover:bg-fuchsia-500/20 text-zinc-300 hover:text-fuchsia-300 text-xs font-bold uppercase tracking-widest">
                          <Pencil className="h-3.5 w-3.5 mr-2" /> {t("settings.edit_btn", "Éditer")}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="flex-none bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL D'AJOUT / ÉDITION */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#1e1333] border-fuchsia-500/30 shadow-2xl max-w-md mx-auto p-0 overflow-hidden border-t-0">
          <div className={cn("w-full h-1.5 bg-gradient-to-r", 
            activeTab === 'boss' ? "from-emerald-600 to-teal-400" :
            activeTab === 'armes' ? "from-amber-600 to-yellow-400" :
            activeTab === 'armures' ? "from-blue-600 to-cyan-400" :
            activeTab === 'accessoires' ? "from-fuchsia-600 to-purple-400" :
            "from-rose-600 to-red-400"
          )} />
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-black uppercase tracking-tighter text-white">
                {editingId ? t("settings.modal_edit_title", "Modifier l'élément") : t("settings.modal_add_title", "Ajouter un élément")}
              </DialogTitle>
              <DialogDescription className="text-zinc-400 text-xs uppercase tracking-widest">
                {t("settings.category", "Catégorie")} : {currentTabConfig?.label}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400 mb-2 block">
                  {t("settings.name_fr", "Nom (Français)")}
                </label>
                <input
                  type="text"
                  value={nameFr}
                  onChange={(e) => setNameFr(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white h-10 rounded-lg px-3 focus:outline-none focus:border-fuchsia-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gaming-gold mb-2 block">
                  {t("settings.name_en", "Nom (Anglais)")}
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white h-10 rounded-lg px-3 focus:outline-none focus:border-gaming-gold transition-colors"
                />
              </div>

              {/* SÉLECTION DES BOSS */}
              {activeTab !== "boss" && activeTab !== "general" && (
                <div className="pt-4 border-t border-white/5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-3 block flex items-center justify-between">
                    {t("settings.linked_bosses", "Boss liés")}
                    <span className="text-[8px] text-zinc-500">
                      {isSingleBoss ? t("settings.single_choice", "(1 choix)") : t("settings.multi_choice", "(Choix multiples)")}
                    </span>
                  </label>
                  
                  <div className="max-h-40 overflow-y-auto space-y-1.5 bg-black/40 border border-white/10 rounded-lg p-3">
                    {bosses.map(boss => (
                      <label key={boss.id} className="flex items-center gap-3 cursor-pointer p-1.5 rounded hover:bg-white/5 transition-colors">
                        <input
                          type={isSingleBoss ? "radio" : "checkbox"}
                          name="boss_selection"
                          value={boss.id}
                          checked={selectedBosses.includes(boss.id.toString())}
                          onChange={(e) => {
                            if (isSingleBoss) {
                              setSelectedBosses([boss.id.toString()]);
                            } else {
                              if (e.target.checked) {
                                setSelectedBosses([...selectedBosses, boss.id.toString()]);
                              } else {
                                setSelectedBosses(selectedBosses.filter(id => id !== boss.id.toString()));
                              }
                            }
                          }}
                          className={cn(
                            "border-white/20 bg-black/40 focus:ring-gaming-gold w-4 h-4 text-fuchsia-500",
                            isSingleBoss ? "rounded-full" : "rounded"
                          )}
                        />
                        <span className="text-xs font-semibold text-zinc-300 select-none">
                          {boss.name[lang] || boss.name.fr}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="ghost" className="flex-1 text-zinc-400 font-black uppercase tracking-widest text-xs hover:text-white" onClick={() => setIsModalOpen(false)}>
                {t("settings.cancel", "Annuler")}
              </Button>
              <Button className="flex-1 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-gaming-gold transition-colors" onClick={handleSave}>
                {t("settings.save", "Sauvegarder")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;