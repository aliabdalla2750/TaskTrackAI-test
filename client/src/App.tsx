import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Agency Dashboard Pages
import AgencyOverview from "@/pages/agency/AgencyOverview";
import EnhancedAgencyDashboard from "@/pages/agency/EnhancedAgencyDashboard";
import AgencyProjects from "@/pages/agency/AgencyProjects";
import CreateSmartProject from "@/pages/agency/CreateSmartProject";
import CreateManualProject from "@/pages/agency/CreateManualProject";
import ProjectDetail from "@/pages/agency/ProjectDetail";
import DailyStandUp from "@/pages/agency/DailyStandUp";
import AgencyDailyReview from "@/pages/agency/AgencyDailyReview";
import AgencyTasks from "@/pages/agency/AgencyTasks";
import TaskDetails from "@/pages/agency/TaskDetails";
import AgencyTeam from "@/pages/agency/AgencyTeam";
import AgencyClients from "@/pages/agency/AgencyClients";
import AgencyFiles from "@/pages/agency/AgencyFiles";
import AgencyAiAssistant from "@/pages/agency/AgencyAiAssistant";
import AiSettings from "@/pages/agency/AiSettings";

// Client Dashboard Pages
import ClientOverview from "@/pages/client/ClientOverview";
import ClientProjects from "@/pages/client/ClientProjects";
import ClientTasks from "@/pages/client/ClientTasks";
import ClientFiles from "@/pages/client/ClientFiles";

// Employee Dashboard Pages
import EmployeeOverview from "@/pages/employee/EmployeeOverview";
import EmployeeTasks from "@/pages/employee/EmployeeTasks";
import EmployeeDailyTasks from "@/pages/employee/EmployeeDailyTasks";
import EmployeeDailyStandupReport from "@/pages/employee/DailyStandupReport";
import EmployeeSubmissions from "@/pages/employee/EmployeeSubmissions";
import EmployeePerformance from "@/pages/employee/EmployeePerformance";
import EmployeeFiles from "@/pages/employee/EmployeeFiles";

// Admin Dashboard Pages
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminAiScenarios from "@/pages/admin/AdminAiScenarios";
import AdminAiProviders from "@/pages/admin/AdminAiProviders";
import AdminAiChatTest from "@/pages/admin/AdminAiChatTest";

function Router() {
  return (
    <Switch>
      {/* Agency Dashboard Routes */}
      <Route path="/" component={EnhancedAgencyDashboard} />
      <Route path="/dashboard/agency/enhanced" component={EnhancedAgencyDashboard} />
      <Route path="/dashboard/agency/overview" component={AgencyOverview} />
      <Route path="/dashboard/agency/projects" component={AgencyProjects} />
      <Route path="/dashboard/agency/projects/:id" component={ProjectDetail} />
      <Route path="/dashboard/agency/create-smart-project" component={CreateSmartProject} />
      <Route path="/dashboard/agency/create-manual-project" component={CreateManualProject} />
      <Route path="/dashboard/agency/tasks" component={AgencyTasks} />
      <Route path="/dashboard/agency/tasks/:taskId" component={TaskDetails} />
      <Route path="/dashboard/agency/team" component={AgencyTeam} />
      <Route path="/dashboard/agency/daily-standup" component={DailyStandUp} />
      <Route path="/dashboard/agency/daily-review" component={AgencyDailyReview} />
      <Route path="/dashboard/agency/clients" component={AgencyClients} />
      <Route path="/dashboard/agency/files" component={AgencyFiles} />
      <Route path="/dashboard/agency/ai-assistant" component={AgencyAiAssistant} />
      <Route path="/dashboard/agency/ai-settings" component={AiSettings} />
      
      {/* Client Dashboard Routes */}
      <Route path="/dashboard/client/overview" component={ClientOverview} />
      <Route path="/dashboard/client/projects" component={ClientProjects} />
      <Route path="/dashboard/client/tasks" component={ClientTasks} />
      <Route path="/dashboard/client/files" component={ClientFiles} />
      
      {/* Employee Dashboard Routes */}
      <Route path="/dashboard/employee/overview" component={EmployeeOverview} />
      <Route path="/dashboard/employee/tasks" component={EmployeeTasks} />
      <Route path="/dashboard/employee/daily-tasks" component={EmployeeDailyTasks} />
      <Route path="/dashboard/employee/daily-standup" component={EmployeeDailyStandupReport} />
      <Route path="/dashboard/employee/submissions" component={EmployeeSubmissions} />
      <Route path="/dashboard/employee/performance" component={EmployeePerformance} />
      <Route path="/dashboard/employee/files" component={EmployeeFiles} />
      
      {/* Admin Dashboard Routes */}
      <Route path="/dashboard/admin/overview" component={AdminOverview} />
      <Route path="/dashboard/admin/users" component={AdminUsers} />
      <Route path="/dashboard/admin/ai-scenarios" component={AdminAiScenarios} />
      <Route path="/dashboard/admin/ai-providers" component={AdminAiProviders} />
      <Route path="/dashboard/admin/ai-chat-test" component={AdminAiChatTest} />
      
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
