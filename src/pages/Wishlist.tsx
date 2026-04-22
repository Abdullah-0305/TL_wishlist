import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Swords, Shield as ShieldIcon, Gem, Save, Info, Lock, CheckCircle2, RefreshCw, Skull } from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getArmes, getArmures, getAccessoires, getRoles, updatePlayer, getPlayerById , createChangeRequest, getArchboss} from "@/api/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useTranslation, Trans } from "react-i18next";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  name: any;
}

type SlotType = "arme" | "armure" | "accessoire" | "archboss";

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.split("-")[0] || "fr";

  const [loading, setLoading] = useState(true);
  const [weapons, setWeapons] = useState<Item[]>([]);
  const [armors, setArmors] = useState<Item[]>([]);
  const [accessories, setAccessories] = useState<Item[]>([]);
  const [archboss, setArchboss] = useState<Item[]>([]);
  const [roles, setRoles] = useState<Item[]>([]);

  const [role, setRole] = useState("");
  const [selectedWeapon, setSelectedWeapon] = useState("");
  const [selectedArmor, setSelectedArmor] = useState("");
  const [selectedAccessory, setSelectedAccessory] = useState("");
  const [selectedArchboss, setSelectedArchboss] = useState("");

  const [weaponLocked, setWeaponLocked] = useState(false);
  const [armorLocked, setArmorLocked] = useState(false);
  const [accessoryLocked, setAccessoryLocked] = useState(false);
  const [archbossLocked, setArchbossLocked] = useState(false);

  const [hasLootedArme, setHasLootedArme] = useState(false);
  const [hasLootedArmure, setHasLootedArmure] = useState(false);
  const [hasLootedAccessoire, setHasLootedAccessoire] = useState(false);
  const [hasLootedArchboss, setHasLootedArchboss] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  // --- NOUVEAUX STATES POUR LA DEMANDE DE CHANGEMENT (Corrigé avec Archboss) ---
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [changeSlotType, setChangeSlotType] = useState<SlotType | null>(null);
  const [changeNewItem, setChangeNewItem] = useState<string>("");

  const getLocalizedName = (nameObj: any) => {
    if (!nameObj) return "???";
    if (typeof nameObj === "string") return nameObj;
    return nameObj[currentLang] || nameObj.fr || "Nom inconnu";
  };

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [w, a, ac, ab, r] = await Promise.all([getArmes(), getArmures(), getAccessoires(), getArchboss(), getRoles()]);
      
      setWeapons(w.data || []);
      setArmors(a.data || []);
      setAccessories(ac.data || []);
      setArchboss(ab.data || []);
      setRoles(r.data || []);

      const { data: player, error } = await getPlayerById(user.id);
      if (error) throw error;
      if (!player) return;

      if (player.role) setRole(player.role.toString());
      
      const wl = player.wishlist || {};

      if (wl.id_arme) { setSelectedWeapon(wl.id_arme.toString()); setWeaponLocked(true); }
      if (wl.id_armure) { setSelectedArmor(wl.id_armure.toString()); setArmorLocked(true); }
      if (wl.id_accessoire) { setSelectedAccessory(wl.id_accessoire.toString()); setAccessoryLocked(true); }
      if (wl.id_archboss) { setSelectedArchboss(wl.id_archboss.toString()); setArchbossLocked(true); }

      setHasLootedArme(wl.has_looted_arme || false);
      setHasLootedArmure(wl.has_looted_armure || false);
      setHasLootedAccessoire(wl.has_looted_accessoires || false);
      setHasLootedArchboss(wl.has_looted_archboss || false);

    } catch (err) {
      console.error(err);
      toast.error(t("wishlist.load_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (!authLoading && user?.id) {
      loadData(); 
    }
  }, [user?.id, authLoading]);

  const handleSave = () => {
    if (!role) { toast.error(t("wishlist.role_required")); return; }
    setModalOpen(true);
  };

  const confirmSave = async () => {
    if (!user?.id) return;
    setModalOpen(false);

    try {
      const { data: currentPlayer } = await getPlayerById(user.id);
      const currentWishlist = currentPlayer?.wishlist || {};
      const newWishlist = { ...currentWishlist };

      if (!weaponLocked && selectedWeapon && selectedWeapon !== "null") {
          newWishlist.id_arme = isNaN(Number(selectedWeapon)) ? selectedWeapon : Number(selectedWeapon);
          newWishlist.date_demand_arme = isNaN(Number(selectedWeapon)) ? null : new Date();
      }
      if (!armorLocked && selectedArmor && selectedArmor !== "null") {
          newWishlist.id_armure = isNaN(Number(selectedArmor)) ? selectedArmor : Number(selectedArmor);
          newWishlist.date_demand_armure = isNaN(Number(selectedArmor)) ? null : new Date();
      }
      if (!accessoryLocked && selectedAccessory && selectedAccessory !== "null") {
          newWishlist.id_accessoire = isNaN(Number(selectedAccessory)) ? selectedAccessory : Number(selectedAccessory);
          newWishlist.date_demand_accessoire = isNaN(Number(selectedAccessory)) ? null : new Date();
      }
      if (!archbossLocked && selectedArchboss && selectedArchboss !== "null") {
          newWishlist.id_archboss = isNaN(Number(selectedArchboss)) ? selectedArchboss : Number(selectedArchboss);
          newWishlist.date_demand_archboss = isNaN(Number(selectedArchboss)) ? null : new Date();
      }

      const updateData = { 
        role: role,
        wishlist: newWishlist 
      };

      const { error } = await updatePlayer(user.id, updateData);
      if (error) throw error;

      toast.success(t("wishlist.save_success"));
      await loadData();
    } catch (err) {
      toast.error(t("wishlist.save_error"));
    }
  };

  // --- LOGIQUE DEMANDE DE CHANGEMENT ---
  const handleOpenChangeRequest = (type: SlotType) => {
    setChangeSlotType(type);
    setChangeNewItem("");
    setChangeModalOpen(true);
  };

  const submitChangeRequest = async () => {
    if (!changeNewItem || changeNewItem === "null") {
      toast.error(t("wishlist.change_select_error", "Veuillez sélectionner un nouvel item."));
      return;
    }

    try {
      if (!user?.id || !changeSlotType) return;
      
      await createChangeRequest({ 
        player_id: user.id, 
        item_type: changeSlotType, 
        new_item_id: changeNewItem 
      });
      
      toast.success(t("wishlist.change_request_sent", "Votre demande de changement a été envoyée à la Co-Gestion !"));
      setChangeModalOpen(false);
    } catch (err) {
      toast.error(t("wishlist.change_request_error", "Erreur lors de l'envoi de la demande. Vous avez peut-être déjà une demande en cours."));
    }
  };

  // Helper pour trouver les bons items pour le modal de changement
  const getChangeItemsList = () => {
    if (changeSlotType === "arme") return weapons;
    if (changeSlotType === "armure") return armors;
    if (changeSlotType === "accessoire") return accessories;
    if (changeSlotType === "archboss") return archboss;
    return [];
  };

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
      
      {/* 📜 RÈGLES DE GUILDE (Inchangé) */}
      <section className="relative overflow-hidden bg-[#1e1333]/40 backdrop-blur-md border border-fuchsia-500/20 rounded-3xl shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-600 via-purple-500 to-gaming-gold" />
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-fuchsia-500/10 rounded-lg">
              <Info className="h-5 w-5 text-fuchsia-400" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
              {t("wishlist.rules_title")}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 text-sm leading-relaxed">
            <div className="space-y-4 text-fuchsia-100/70">
              <div className="bg-white/5 p-4 rounded-xl border-l-4 border-fuchsia-500">
                <Trans i18nKey="wishlist.basic_rule" components={{ 1: <b className="text-white" /> }}>
                  💠 Vous pouvez mettre dans la wishlist <b>un seul item pour</b> les Armes, les Armures et les Accessoires.
                </Trans>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border-l-4 border-red-500/50 italic font-bold text-fuchsia-200">
                <Trans i18nKey="wishlist.lock_rule" components={{ 1: <span className="text-red-400" /> }}>
                  🔒 Une fois la wishlist validée, <b>vous ne pourrez plus modifier vos choix</b>.
                </Trans>
              </div>
            </div>

            <div className="space-y-4 border-l border-white/5 pl-0 md:pl-8">
              <h3 className="font-black text-xs uppercase tracking-widest text-gaming-gold mb-2">
                {t("wishlist.boss_rules_title")}
              </h3>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="group">
                    <p className="text-white font-bold text-[13px] mb-1 group-hover:text-gaming-gold transition-colors">
                      {t(`wishlist.rule_${i}_title`)}
                    </p>
                    <div className="text-xs text-fuchsia-100/50">
                      {i === 3 ? (
                        <Trans i18nKey="wishlist.rule_3_desc" components={{ 1: <strong className="text-white font-bold" /> }}>
                          Priorité aux joueurs <strong>présents, anciens et actifs.</strong> Une fois un loot obtenu...
                        </Trans>
                      ) : (
                        t(`wishlist.rule_${i}_desc`)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5">
             <h3 className="font-black text-xs uppercase tracking-widest text-fuchsia-400 mb-2">{t("wishlist.change_title")}</h3>
             <div className="text-xs text-fuchsia-100/40 leading-relaxed">
                <Trans i18nKey="wishlist.change_desc" components={{ 1: <strong />, 3: <strong />, 5: <strong /> }}>
                  Si vous avez déjà obtenu <strong>un item</strong>... contactez la <strong>Co-Gestion</strong>.
                </Trans>
             </div>
          </div>
        </div>
      </section>

      {/* 🛡️ CONFIGURATION DU PERSONNAGE */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* SÉLECTION DU RÔLE */}
        <div className="lg:col-span-3 bg-[#1e1333]/60 border border-fuchsia-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <h3 className="text-lg font-black uppercase tracking-tighter text-white">{t("wishlist.role_title")}</h3>
            <p className="text-xs text-fuchsia-100/40 uppercase tracking-widest">{t("wishlist.role_desc")}</p>
          </div>
          <div className="flex-grow w-full">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-black/40 border-fuchsia-500/20 text-white h-12 rounded-xl focus:ring-gaming-gold">
                <SelectValue placeholder={t("wishlist.select_role")} />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1333] border-fuchsia-500/30 text-white">
                {roles.map(r => (
                  <SelectItem key={r.id} value={r.id.toString()} className="focus:bg-fuchsia-500/20 cursor-pointer">
                    {getLocalizedName(r.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* SLOTS D'ÉQUIPEMENT */}
        {[
          { id: 'arme', title: t("wishlist.weapons_title"), icon: Swords, color: 'text-amber-400', items: weapons, locked: weaponLocked, selected: selectedWeapon, setter: setSelectedWeapon, looted: hasLootedArme, placeholder: t("wishlist.select_weapon") },
          { id: 'armure', title: t("wishlist.armors_title"), icon: ShieldIcon, color: 'text-blue-400', items: armors, locked: armorLocked, selected: selectedArmor, setter: setSelectedArmor, looted: hasLootedArmure, placeholder: t("wishlist.select_armor") },
          { id: 'accessoire', title: t("wishlist.accessories_title"), icon: Gem, color: 'text-purple-400', items: accessories, locked: accessoryLocked, selected: selectedAccessory, setter: setSelectedAccessory, looted: hasLootedAccessoire, placeholder: t("wishlist.select_accessory") },
          { id: 'archboss', title: t("wishlist.archboss_title", "Archboss"), icon: Skull, color: 'text-red-400', items: archboss, locked: archbossLocked, selected: selectedArchboss, setter: setSelectedArchboss, looted: hasLootedArchboss, placeholder: t("wishlist.select_archboss", "Choisir un item")}
        ].map((slot) => (
          <div key={slot.id} className={cn(
            "relative group bg-[#1e1333]/60 border rounded-2xl p-6 transition-all duration-300",
            slot.looted ? "border-purple-500/50 shadow-lg shadow-purple-950/20" : "border-fuchsia-500/20"
          )}>
            <div className="flex items-center justify-between mb-6">
              <div className={cn("p-3 rounded-xl bg-white/5 border border-white/5", slot.color)}>
                <slot.icon className="h-6 w-6" />
              </div>
              {slot.locked && !slot.looted && <Lock className="h-4 w-4 text-zinc-500" />}
              {slot.looted && <CheckCircle2 className="h-5 w-5 text-purple-400 animate-pulse" />}
            </div>

            <h3 className="font-black uppercase tracking-widest text-[10px] text-fuchsia-300/50 mb-4">{slot.title}</h3>

            <Select disabled={slot.locked} value={slot.selected} onValueChange={slot.setter}>
              <SelectTrigger className={cn(
                "bg-black/40 border-white/5 text-white h-11 rounded-lg",
                slot.locked && "opacity-60 grayscale-[0.5]"
              )}>
                <SelectValue placeholder={slot.placeholder} />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1333] border-fuchsia-500/30 text-white max-h-[300px]">
                <SelectItem value="null" className="italic text-zinc-500 cursor-pointer">{t("wishlist.none")}</SelectItem>
                {slot.items.map(i => (
                  <SelectItem key={i.id} value={i.id.toString()} className="cursor-pointer">
                    {getLocalizedName(i.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* MESSAGE / BOUTON SI VERROUILLÉ */}
            {slot.locked && !slot.looted && (
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] text-red-400/70 font-bold uppercase tracking-tighter">
                  {t("wishlist.already_chosen")}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-[9px] uppercase tracking-widest text-gaming-gold border border-gaming-gold/30 hover:bg-gaming-gold/10 transition-all"
                  onClick={() => handleOpenChangeRequest(slot.id as SlotType)}
                >
                  <RefreshCw className="h-3 w-3 mr-1.5" />
                  {t("wishlist.request_change_btn", "Changer ?")}
                </Button>
              </div>
            )}
            
            {/* SI LOOTÉ */}
            {slot.looted && (
              <div className="mt-4 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-center">
                <span className="text-[10px] font-black uppercase text-purple-400 tracking-tighter">
                  ✨ {t("wishlist.looted_tag")} ✨
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* BOUTON SAUVEGARDE PRINCIPAL */}
      <div className="flex flex-col items-center gap-4">
        <Button 
          onClick={handleSave}
          disabled={weaponLocked && armorLocked && accessoryLocked && archbossLocked}
          className="group relative bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-black px-12 py-7 h-auto rounded-2xl shadow-2xl shadow-fuchsia-900/40 border-b-4 border-fuchsia-900/60 transition-all active:translate-y-1 active:border-b-0 uppercase tracking-widest text-sm disabled:opacity-50 disabled:grayscale"
        >
          <Save className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
          {t("wishlist.save")}
        </Button>
      </div>

      {/* MODAL DE SAUVEGARDE (Inchangé) */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#1e1333] border-fuchsia-500/30 shadow-2xl max-w-sm mx-auto p-0 overflow-hidden border-t-0">
          <div className="w-full h-1.5 bg-gradient-to-r from-fuchsia-600 via-purple-500 to-gaming-gold" />
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 mb-6 shadow-glow-fuchsia">
              <Lock className="h-8 w-8" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter text-white mb-2">
              {t("wishlist.modal_title")}
            </DialogTitle>
            <DialogDescription className="text-fuchsia-100/60 text-sm leading-relaxed mb-8">
              {t("wishlist.modal_desc")}
            </DialogDescription>
            <div className="flex gap-3 w-full">
              <Button variant="ghost" className="flex-1 text-fuchsia-300/50 font-bold uppercase tracking-widest text-xs" onClick={() => setModalOpen(false)}>
                {t("wishlist.cancel")}
              </Button>
              <Button className="flex-1 bg-gaming-gold text-black font-black uppercase tracking-widest text-xs shadow-glow-gold hover:bg-white transition-all" onClick={confirmSave}>
                {t("wishlist.confirm")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL DE DEMANDE DE CHANGEMENT */}
      <Dialog open={changeModalOpen} onOpenChange={setChangeModalOpen}>
        <DialogContent className="bg-[#1e1333] border-gaming-gold/30 shadow-2xl max-w-md mx-auto p-0 overflow-hidden border-t-0">
          <div className="w-full h-1.5 bg-gradient-to-r from-gaming-gold via-amber-500 to-orange-500" />
          <div className="p-8 flex flex-col items-center text-center">
            
            <div className="w-16 h-16 rounded-2xl bg-gaming-gold/10 border border-gaming-gold/30 flex items-center justify-center text-gaming-gold mb-6 shadow-glow-gold">
              <RefreshCw className="h-8 w-8" />
            </div>
            
            <DialogTitle className="text-xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gaming-gold mb-2">
              {t("wishlist.change_request_title", "Demande d'échange")}
            </DialogTitle>
            
            <DialogDescription className="text-fuchsia-100/70 text-sm leading-relaxed mb-6">
              {t("wishlist.change_request_desc", "Sélectionnez l'objet que vous souhaitez en remplacement. La Co-Gestion validera votre demande.")}
            </DialogDescription>

            <div className="w-full mb-8 text-left">
              <label className="text-[10px] font-black uppercase tracking-widest text-fuchsia-300/50 mb-2 block">
                {t("wishlist.new_item_label", "Nouvel objet souhaité :")}
              </label>
              <Select value={changeNewItem} onValueChange={setChangeNewItem}>
                <SelectTrigger className="bg-black/50 border-gaming-gold/30 text-white h-12 rounded-xl focus:ring-gaming-gold">
                  <SelectValue placeholder={t("wishlist.select_new_item", "Choisir...")} />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1333] border-gaming-gold/30 text-white max-h-[250px]">
                  {getChangeItemsList().map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()} className="focus:bg-gaming-gold/20 cursor-pointer">
                      {getLocalizedName(item.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 w-full">
              <Button variant="ghost" className="flex-1 text-fuchsia-300/50 font-bold uppercase tracking-widest text-xs hover:text-white" onClick={() => setChangeModalOpen(false)}>
                {t("wishlist.cancel")}
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-gaming-gold to-orange-500 text-black font-black uppercase tracking-widest text-xs hover:from-white hover:to-white transition-all shadow-glow-gold" onClick={submitChangeRequest}>
                {t("wishlist.send_request", "Envoyer")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wishlist;