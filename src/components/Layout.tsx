import { Link, useLocation } from "react-router-dom";
import { Swords, Shield, UserCog, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Si on est sur /change-password, on ne montre pas les items de nav
  const showNavItems = location.pathname !== "/change-password";

  const navItems = [
    !user && { path: "/login", label: "Connexion", icon: Shield },
    user && { path: "/wishlist", label: "Wishlist", icon: Swords },
    user?.isAdmin && { path: "/admin", label: "Admin", icon: UserCog },
  ].filter(Boolean); // supprime les items falsy

  return (
    <div className="min-h-screen bg-gradient-dark">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo toujours affiché */}
            <Link to="/" className="flex items-center gap-2">
              <Swords className="h-6 w-6 text-gaming-gold" />
              <span className="text-xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                Akatsushi
              </span>
            </Link>

            {/* Items de nav et logout seulement si showNavItems = true */}
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
                    <span className="hidden sm:inline">Se déconnecter</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};
