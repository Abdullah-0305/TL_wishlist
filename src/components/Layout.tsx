import { Link, useLocation } from "react-router-dom";
import { Swords, Shield, UserCog, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  // 🛠️ CORRECTION : On utilise signOut à la place de logout
  const { user, signOut } = useAuth(); 
  const { t } = useTranslation();

  const showNavItems = location.pathname !== "/change-password";

  const navItems = [
    !user && { path: "/login", label: t('nav.login'), icon: Shield },
    user && { path: "/wishlist", label: t('nav.wishlist'), icon: Swords },
    user?.isAdmin && { path: "/admin", label: t('nav.admin'), icon: UserCog },
  ].filter(Boolean) as any[];

  return (
    <div className="min-h-screen bg-[#0a0b10] text-zinc-100 flex flex-col overflow-x-hidden">
      {/* HEADER HUD */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#1e1333]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <nav className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-1 sm:gap-4">
            
            {/* LOGO - Texte réduit sur mobile pour tenir sur la ligne */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0 group">
              <div className="p-1.5 bg-gradient-to-br from-gaming-gold to-amber-600 rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <Swords className="h-4 w-4 sm:h-5 text-black" />
              </div>
              <span className="text-sm sm:text-xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                Akatsushi
              </span>
            </Link>

            {/* NAVIGATION & ACTIONS */}
            {showNavItems && (
              <div className="flex items-center gap-1 sm:gap-3">
                {/* Capsule de Navigation - Paddings réduits sur mobile (px-2) */}
                <div className="flex bg-black/40 p-0.5 sm:p-1 rounded-xl border border-white/5">
                  {navItems.map((item: any) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "relative flex items-center gap-2 px-2.5 sm:px-5 py-2 rounded-lg transition-all duration-300",
                          isActive
                            ? "text-fuchsia-400 bg-fuchsia-500/10"
                            : "text-zinc-500 hover:text-zinc-200"
                        )}
                      >
                        <item.icon className={cn("h-4 w-4", isActive ? "animate-pulse" : "")} />
                        <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">
                          {item.label}
                        </span>
                        
                        {isActive && (
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,0.8)]" />
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Bouton Quitter - Plus petit sur mobile */}
                {user && (
                  <button
                    onClick={signOut} // 🛠️ CORRECTION : On appelle signOut
                    className="p-1.5 sm:p-2.5 rounded-xl text-zinc-600 hover:text-red-500 transition-all active:scale-90"
                    title={t('nav.logout')}
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* ZONE DE CONTENU */}
      <main className="flex-grow pt-20 sm:pt-32 pb-12 animate-in fade-in duration-1000">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>

      {/* DÉCORATION AMBIANTE */}
      <div className="fixed bottom-0 left-0 w-full h-1/3 bg-[radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.05)_0%,_rgba(10,11,16,0)_70%)] pointer-events-none z-0" />
    </div>
  );
};