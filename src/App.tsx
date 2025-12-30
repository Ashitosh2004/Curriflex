import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import TimetablePage from "./pages/TimetablePage";
import FacultyPage from "./pages/FacultyPage";
import StudentsPage from "./pages/StudentsPage";
import SubjectsPage from "./pages/SubjectsPage";
import RoomsPage from "./pages/RoomsPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import TimeConfigPage from "./pages/TimeConfigPage";
import SubjectAllocationPage from "./pages/SubjectAllocationPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/timetable" element={<TimetablePage />} />
              <Route path="/faculty" element={<FacultyPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/subject-allocation" element={<SubjectAllocationPage />} />
              <Route path="/time-config" element={<TimeConfigPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
