import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { pingHeartbeatOnce } from "@/lib/heartbeat";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const APP_CLIENT_VERSION = "2026-07-10-mobile-archive-v4";

// Use HashRouter for Chrome Extension, BrowserRouter for web
const isExtension = typeof window !== 'undefined' && (window as any).__EXTENSION__;
const Router = isExtension ? HashRouter : BrowserRouter;

const clearStaleClientCaches = async () => {
  if (typeof window === 'undefined') return;

  const storageKey = 'founder-hub-client-version';
  const reloadKey = `${storageKey}:reloaded`;
  const previousVersion = window.localStorage.getItem(storageKey);
  window.localStorage.setItem(storageKey, APP_CLIENT_VERSION);

  if (!previousVersion || previousVersion === APP_CLIENT_VERSION || window.sessionStorage.getItem(reloadKey)) {
    window.sessionStorage.removeItem(reloadKey);
    return;
  }

  window.sessionStorage.setItem(reloadKey, 'true');

  await Promise.allSettled([
    'caches' in window ? caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))) : Promise.resolve(),
    !isExtension && 'serviceWorker' in navigator
      ? navigator.serviceWorker.getRegistrations().then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      : Promise.resolve(),
  ]);

  window.location.reload();
};

const App = () => {
  useEffect(() => {
    pingHeartbeatOnce();
    clearStaleClientCaches();
  }, []);
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/company/:id" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
