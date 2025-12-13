import { useTheme } from "./hooks/use-theme";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WelcomeBanner from "./components/WelcomeBanner";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();



const App = () => {
  useTheme();

  const [showWelcome, setWelcome] = useState(false);
  useEffect(() => {
    const sawBanner = sessionStorage.getItem("sawWelcomeBanner"); // usin session storage instead of local storage so it shows again after closing tab
    if (!sawBanner) {
      setWelcome(true);
    }
  }, 
  []);

  const exitBanner = () => {
    setWelcome(false);
    sessionStorage.setItem("sawWelcomeBanner", "true");
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showWelcome && <WelcomeBanner onDismiss={exitBanner} />}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL. guys pls dont make the 
          same mistake as task 1 :((( "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
