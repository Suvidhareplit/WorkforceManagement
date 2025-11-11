import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/useAuth";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import CreateHiringRequest from "./pages/hiring/CreateHiringRequest";
import ViewHiringRequests from "./pages/hiring/ViewHiringRequests";
import CandidateApplication from "./pages/interviews/CandidateApplication";
import Prescreening from "./pages/interviews/Prescreening";
import TechnicalRound from "./pages/interviews/TechnicalRound";
import OfferManagement from "./pages/interviews/OfferManagement";
import InductionTraining from "./pages/training/InductionTraining";
import ClassroomTraining from "./pages/training/ClassroomTraining";
import FieldTraining from "./pages/training/FieldTraining";
import Onboarding from "./pages/training/Onboarding";
import EmployeeLifecycle from "./pages/employee/EmployeeLifecycle";
import ExitManagement from "./pages/employee/ExitManagement";
import MasterData from "./pages/master/MasterData";
import LeaveManagement from "./pages/leave/LeaveManagement";
import UserManagement from "./pages/management/UserManagement";
import Analytics from "./pages/analytics/Analytics";
import HiringAnalytics from "./pages/analytics/HiringAnalytics";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/hiring/create" component={CreateHiringRequest} />
        <Route path="/hiring/requests" component={ViewHiringRequests} />
        <Route path="/interviews/applications" component={CandidateApplication} />
        <Route path="/interviews/prescreening" component={Prescreening} />
        <Route path="/interviews/technical" component={TechnicalRound} />
        <Route path="/interviews/offers" component={OfferManagement} />
        <Route path="/training/induction" component={InductionTraining} />
        <Route path="/training/classroom" component={ClassroomTraining} />
        <Route path="/training/field" component={FieldTraining} />
        <Route path="/training/onboarding" component={Onboarding} />
        <Route path="/employees/lifecycle" component={EmployeeLifecycle} />
        <Route path="/employees/exit" component={ExitManagement} />
        <Route path="/master-data" component={MasterData} />
        <Route path="/leave-management" component={LeaveManagement} />
        <Route path="/management/users" component={UserManagement} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/analytics/hiring" component={HiringAnalytics} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
