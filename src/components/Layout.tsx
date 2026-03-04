import { Link, useLocation } from 'wouter';
import { useAuth } from '../lib/auth';
import { 
  LayoutDashboard, 
  Users, 
  Calculator, 
  Settings, 
  LogOut, 
  FileText, 
  ShieldAlert,
  Menu
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils'; // Need to create utils
import { Button } from './ui/button'; // Need to create button

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <>{children}</>;

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/employees', label: 'Zaposleni', icon: Users },
    { href: '/payroll', label: 'Obračun Plata', icon: Calculator },
    { href: '/analysis', label: 'Analiza', icon: FileText },
    { href: '/protection', label: 'Zaštitne Klauzule', icon: ShieldAlert },
    { href: '/parameters', label: 'Parametri', icon: Settings, role: 'ADMIN' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#1B3A6B] text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <h1 className="text-xl font-bold tracking-tight">IMH PLATE</h1>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            if (item.role && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') return null;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer",
                  isActive ? "bg-white/10 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
                )}>
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-sm font-bold">
              {user.name?.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Odjava
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4">
          <span className="font-bold text-[#1B3A6B]">IMH PLATE</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
