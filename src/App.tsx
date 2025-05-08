
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { EventProvider } from "@/contexts/EventContext";
import { ParticipantProvider } from "@/contexts/ParticipantContext";

// Pages
import Login from "@/pages/Login";
import EventRegistration from "@/pages/EventRegistration";
import ParticipantRegistration from "@/pages/ParticipantRegistration";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <EventProvider>
          <ParticipantProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/event-registration" element={<EventRegistration />} />
                <Route path="/participant-registration" element={<ParticipantRegistration />} />
                {/* Add more routes here as the remaining features are implemented */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ParticipantProvider>
        </EventProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
