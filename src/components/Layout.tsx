import { Link, useLocation } from "react-router-dom";
import { Swords, Shield, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  const navItems = [
    { path: "/login", label: "Connexion", icon: Shield },
    { path: "/wishlist", label: "Wishlist", icon: Swords },
    { path: "/admin", label: "Admin", icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Swords className="h-6 w-6 text-gaming-gold" />
              <span className="text-xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                Akatsushi
              </span>
            </Link>
            
            <div className="flex gap-1">
              {navItems.map((item) => (
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
            </div>
          </div>
        </nav>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
