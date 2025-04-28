import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import NotFound from "./pages/NotFound";
import IocAnalysis from "./pages/IocAnalysis";
import { RiskScoreDemo } from "./pages/RiskScoreDemo";
import Documentation from "./pages/Documentation";
import Vulnerabilities from "./pages/Vulnerabilities";
import CyberAI from './pages/CyberAI';

const queryClient = new QueryClient();

const VIRUSTOTAL_API_KEY = import.meta.env.VITE_VIRUSTOTAL_API_KEY;
const OTX_API_KEY = import.meta.env.VITE_OTX_API_KEY;
const URLHAUS_API_KEY = import.meta.env.VITE_URLHAUS_API_KEY;
const THREATFOX_API_KEY = import.meta.env.VITE_THREATFOX_API_KEY;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<IocAnalysis />} />
            <Route path="/risk-score" element={<RiskScoreDemo />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
            <Route path="/cyber-ai" element={<CyberAI />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
