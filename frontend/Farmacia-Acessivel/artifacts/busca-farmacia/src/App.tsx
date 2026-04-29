import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { BuscaSection } from "@/components/BuscaSection";
import { MedicamentosSection } from "@/components/MedicamentosSection";
import { FAQSection } from "@/components/FAQSection";
import { FooterModal } from "@/components/FooterModal";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function HomePage() {
  const [locationActive, setLocationActive] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  function handleUseLocation() {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationActive(true);
          setLocationLoading(false);
          document.getElementById("mapa")?.scrollIntoView({ behavior: "smooth" });
        },
        () => {
          setUserLocation({ lat: -25.4284, lng: -49.2733 });
          setLocationActive(true);
          setLocationLoading(false);
          document.getElementById("mapa")?.scrollIntoView({ behavior: "smooth" });
        },
        { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
      );
    } else {
      setTimeout(() => {
        setUserLocation({ lat: -25.4284, lng: -49.2733 });
        setLocationActive(true);
        setLocationLoading(false);
        document.getElementById("mapa")?.scrollIntoView({ behavior: "smooth" });
      }, 800);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* pt-16 para compensar o header fixo (h ≈ 64px) */}
      <main className="pt-16">
        <HeroSection onUseLocation={handleUseLocation} loading={locationLoading} />
        <BuscaSection locationActive={locationActive} userLocation={userLocation} />
        <MedicamentosSection />
        <FAQSection />
      </main>
      <FooterModal />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
