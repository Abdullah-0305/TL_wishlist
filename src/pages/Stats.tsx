import React, { useState } from "react";
import { Search, ScrollText} from "lucide-react";
import Scanner from "../components/Presence/Scanner";
import History from "../components/Presence/History";
import WeeklyStats from "../components/Presence/WeeklyStats";
import { Button } from "@/components/ui/button";

import { useTranslation } from "react-i18next";

export default function AttendancePage() {

  const { t, i18n } = useTranslation();

    const [activeTab, setActiveTab] = useState<"scan" | "history" | "stats">("scan");
    const [pendingCount, setPendingCount] = useState(0);


  return (
    <div className="min-h-screen bg-[#0a0b10] text-zinc-100 pb-20 p-4 md:p-10 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* HEADER DE LA PAGE */}
        <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3 bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
              <Search className="h-10 w-10 text-emerald-500" />
              Scan de Présence
            </h1>
            <p className="text-zinc-400 font-medium mt-2 text-sm">
              Croisement Vocal Discord & Inscriptions Raid-Helper
            </p>
          </div>
          
          {/* --- MENU DES ONGLETS --- */}
          <div className="flex flex-wrap sm:flex-nowrap space-y-2 sm:space-y-0 sm:space-x-2 bg-[#1e1333]/60 p-1.5 rounded-xl border border-white/5 shadow-inner w-full md:w-fit mb-8">
            
            <Button
              variant="ghost"
              onClick={() => setActiveTab("scan")}
              className={`flex-1 md:flex-none gap-2 px-6 h-10 transition-all border ${
                activeTab === "scan" 
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_15px_rgba(217,70,239,0.15)] hover:bg-emerald-500/25 hover:text-emerald-200" 
                  : "border-transparent text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-300"
              }`}
            >
              <Search className="h-4 w-4" /> Scan
            </Button>

            <Button
            variant="ghost"
            onClick={() => setActiveTab("history")}
            className={`flex-1 md:flex-none gap-2 px-6 h-10 transition-all border ${
              activeTab === "history" 
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:bg-cyan-500/25 hover:text-cyan-200" 
                : "border-transparent text-zinc-400 hover:bg-cyan-500/10 hover:text-cyan-300"
            }`}
          >
            <ScrollText className="h-4 w-4" /> {t("admin.history")}
          </Button>

          <Button
            variant="ghost"
            onClick={() => setActiveTab("stats")}
            className={`flex-1 md:flex-none gap-2 px-5 h-10 transition-all border ${
              activeTab === "stats" 
                ? "bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.12)] hover:bg-purple-500/25 hover:text-purple-200" 
                : "border-transparent text-zinc-400 hover:bg-purple-500/10 hover:text-purple-300"
            }`}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg> Stats
          </Button>
          </div>
        </div>

        {
          (activeTab === "scan") && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <Scanner />
            </div>
          )}
        
        {
          (activeTab === "history") && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <History />
            </div>
          )
        }

        {
          (activeTab === "stats") && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <WeeklyStats />
            </div>
          )
        }
      </div>
    </div>
  );
}