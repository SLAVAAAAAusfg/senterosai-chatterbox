
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider } from "./contexts/SettingsContext";
import { ChatProvider } from "./contexts/ChatContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Intro from "./pages/Intro";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const [showIntro, setShowIntro] = useState(false);
  
  useEffect(() => {
    // Check if the user came from a search engine
    const isFromSearch = document.referrer && (
      document.referrer.includes('google.com') ||
      document.referrer.includes('bing.com') ||
      document.referrer.includes('yahoo.com') ||
      document.referrer.includes('yandex.com') ||
      document.referrer.includes('duckduckgo.com') ||
      document.referrer.includes('baidu.com')
    );
    
    // Check if user has seen the intro before
    const hasSeenIntro = localStorage.getItem('hasSeenIntro') === 'true';
    
    // Show intro if from search and hasn't seen it before
    setShowIntro(isFromSearch && !hasSeenIntro);
  }, []);

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          showIntro ? 
          <Navigate to="/intro" replace /> : 
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } 
      />
      <Route path="/intro" element={<Intro />} />
      <Route path="/auth" element={<Auth />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SettingsProvider>
        <AuthProvider>
          <ChatProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ChatProvider>
        </AuthProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
