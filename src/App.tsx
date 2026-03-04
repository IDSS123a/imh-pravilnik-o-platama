import { Switch, Route, Redirect } from 'wouter';
import { AuthProvider, useAuth } from './lib/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B3A6B]" />
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/employees">
        <ProtectedRoute component={Employees} />
      </Route>
      <Route path="/payroll">
        <ProtectedRoute component={Payroll} />
      </Route>
      {/* Add other routes here */}
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
