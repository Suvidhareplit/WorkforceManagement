import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import UserManagement from './pages/management/UserManagement';
import HiringRequests from './pages/hiring/HiringRequests';
import InterviewManagement from './pages/interview/InterviewManagement';
import InductionTraining from './pages/training/InductionTraining';
import ClassroomTraining from './pages/training/ClassroomTraining';
import FieldTraining from './pages/training/FieldTraining';
import EmployeeLifecycle from './pages/employee/EmployeeLifecycle';
import ExitManagement from './pages/employee/ExitManagement';
import MasterData from './pages/master/MasterData';
import Analytics from './pages/Analytics';
import Layout from './components/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route>
            <Layout>
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/users" component={UserManagement} />
                <Route path="/hiring" component={HiringRequests} />
                <Route path="/interviews" component={InterviewManagement} />
                <Route path="/training/induction" component={InductionTraining} />
                <Route path="/training/classroom" component={ClassroomTraining} />
                <Route path="/training/field" component={FieldTraining} />
                <Route path="/employees" component={EmployeeLifecycle} />
                <Route path="/exit" component={ExitManagement} />
                <Route path="/master" component={MasterData} />
                <Route path="/analytics" component={Analytics} />
              </Switch>
            </Layout>
          </Route>
        </Switch>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;