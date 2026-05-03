import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Wishlist from "./pages/Wishlist";
import Admin from "./pages/Admin/Admin";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LanguageSwitcher from "./components/LanguageSwitcher";
import Maintenance from "./pages/Maintenance";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const AppContent = () => {
  // 1. 🛠️ AJOUT DE 'loading' ICI
  const { user, loading } = useAuth();
  
  const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === "true";

  if (isMaintenance) {
    return (
      <>
        <LanguageSwitcher />
        <Maintenance />
      </>
    );
  }

  // 2. 🛠️ LA BARRIÈRE MAGIQUE : On bloque tout affichage le temps que Supabase lise l'URL Discord
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" />
      </div>
    );
  }

  // 3. Si pas de maintenance et chargement fini, on affiche les routes
  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/wishlist" replace /> : <Navigate to="/login" replace />}
        />
        <Route path="/login" element={user ? <Navigate to="/wishlist" replace /> : <Login />} />
        <Route path="/wishlist" element={user ? <Wishlist /> : <Navigate to="/login" replace />} />
        <Route path="/admin" element={user.is_admin ? <Admin /> : <Navigate to="/login" replace />} />
        <Route path="/settings" element={user.is_admin ? <Settings /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <LanguageSwitcher />
    </Layout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;