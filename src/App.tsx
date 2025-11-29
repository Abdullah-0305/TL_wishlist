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

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Page par défaut */}
      <Route
        path="/"
        element={user ? <Navigate to="/wishlist" replace /> : <Navigate to="/login" replace />}
      />

      {/* Login */}
      <Route path="/login" element={user ? <Navigate to="/wishlist" replace /> : <Login />} />

      {/* Wishlist (protégé) */}
      <Route path="/wishlist" element={user ? <Wishlist /> : <Navigate to="/login" replace />} />

      {/* Admin (protégé) */}
      <Route path="/admin" element={user ? <Admin /> : <Navigate to="/login" replace />} />

      {/* Change MDP Première fois*/}
      <Route path="change-password" element={user ? <ChangePassword/> : <Navigate to="/login" replace />}   />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <AppRoutes />
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
