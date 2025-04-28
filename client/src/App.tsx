import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Agency Dashboard Pages
import AgencyOverview from "@/pages/agency/AgencyOverview";
import AgencyProjects from "@/pages/agency/AgencyProjects";
import CreateSmartProject from "@/pages/agency/CreateSmartProject";
import AgencyTasks from "@/pages/agency/AgencyTasks";
import AgencyTeam from "@/pages/agency/AgencyTeam";
import AgencyClients from "@/pages/agency/AgencyClients";
import AgencyFiles from "@/pages/agency/AgencyFiles";
import AgencyAiAssistant from "@/pages/agency/AgencyAiAssistant";

// Client Dashboard Pages
import ClientOverview from "@/pages/client/ClientOverview";
import ClientProjects from "@/pages/client/ClientProjects";
import ClientTasks from "@/pages/client/ClientTasks";
import ClientFiles from "@/pages/client/ClientFiles";

// Admin Dashboard Pages
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminAiScenarios from "@/pages/admin/AdminAiScenarios";

// Employee Dashboard Pages
import EmployeeOverview from "@/pages/employee/EmployeeOverview";
import EmployeeTasks from "@/pages/employee/EmployeeTasks";

function Router() {
  return (
    <Switch>
      {/* Agency Dashboard Routes */}
      <Route path="/" component={AgencyOverview} />
      <Route path="/dashboard/agency/overview" component={AgencyOverview} />
      <Route path="/dashboard/agency/projects" component={AgencyProjects} />
      <Route path="/dashboard/agency/create-project-smart" component={CreateSmartProject} />
      <Route path="/dashboard/agency/tasks" component={AgencyTasks} />
      <Route path="/dashboard/agency/team" component={AgencyTeam} />
      <Route path="/dashboard/agency/clients" component={AgencyClients} />
      <Route path="/dashboard/agency/files" component={AgencyFiles} />
      <Route path="/dashboard/agency/ai-assistant" component={AgencyAiAssistant} />
      
      {/* Client Dashboard Routes */}
      <Route path="/dashboard/client/overview" component={ClientOverview} />
      <Route path="/dashboard/client/projects" component={ClientProjects} />
      <Route path="/dashboard/client/tasks" component={ClientTasks} />
      <Route path="/dashboard/client/files" component={ClientFiles} />
      
      {/* Admin Dashboard Routes */}
      <Route path="/dashboard/admin/overview" component={AdminOverview} />
      <Route path="/dashboard/admin/users" component={AdminUsers} />
      <Route path="/dashboard/admin/ai-scenarios" component={AdminAiScenarios} />
      
      {/* Employee Dashboard Routes */}
      <Route path="/dashboard/employee/overview" component={EmployeeOverview} />
      <Route path="/dashboard/employee/tasks" component={EmployeeTasks} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
