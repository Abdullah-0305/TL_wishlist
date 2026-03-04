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
import ChangePassword from "./pages/ChangePassword";
import LanguageSwitcher from "./components/LanguageSwitcher";
import Maintenance from "./pages/Maintenance";


const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  
  // 1. On check la maintenance ici
  const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === "true";

  if (isMaintenance) {
    return (
      <>
        <LanguageSwitcher />
        <Maintenance />
      </>
    );
  }

  // 2. Si pas de maintenance, on affiche les routes normales
  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/wishlist" replace /> : <Navigate to="/login" replace />}
        />
        <Route path="/login" element={user ? <Navigate to="/wishlist" replace /> : <Login />} />
        <Route path="/wishlist" element={user ? <Wishlist /> : <Navigate to="/login" replace />} />
        <Route path="/admin" element={user ? <Admin /> : <Navigate to="/login" replace />} />
        <Route path="/change-password" element={user ? <ChangePassword/> : <Navigate to="/login" replace />} />
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