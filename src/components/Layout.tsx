import { Link, useLocation } from "react-router-dom";
import { Swords, Shield, UserCog, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next"; // 1. Import du hook
import LanguageSwitcher from "./LanguageSwitcher"; // 2. Ton composant

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const showNavItems = location.pathname !== "/change-password";

  const navItems = [
    !user && { path: "/login", label: t('nav.login'), icon: Shield },
    user && { path: "/wishlist", label: t('nav.wishlist'), icon: Swords },
    user?.isAdmin && { path: "/admin", label: t('nav.admin'), icon: UserCog },
  ].filter(Boolean) as any[];

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* 1. On rend le header fixed, on l'étire sur toute la largeur (w-full) et on fixe le z-index */}
      <header className="fixed top-0 left-0 w-full z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Swords className="h-6 w-6 text-gaming-gold" />
              <span className="text-xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                Akatsushi
              </span>
            </Link>

            {showNavItems && (
              <div className="flex gap-1 items-center">
                {navItems.map((item: any) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                      "hover:bg-primary/20 hover:text-primary",
                      location.pathname === item.path
                        ? "bg-primary text-primary-foreground shadow-glow-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                ))}

                {user && (
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:bg-red-600 hover:text-white transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('nav.logout')}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* 2. On ajoute un pt-16 (padding-top) pour compenser la hauteur du header (h-16) */}
      <main className="container mx-auto px-4 py-8 pt-24">
        {children}
      </main>
    </div>
  );
};