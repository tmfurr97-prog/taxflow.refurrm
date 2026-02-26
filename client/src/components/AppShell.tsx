import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard, Building2, Shield, Bitcoin, Receipt,
  CreditCard, User, LogOut, Menu, X, Send, Database,
  FileText, BookOpen, ChevronLeft, ChevronRight, Home,
  DollarSign, NotebookPen, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLoginUrl } from '@/const';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Send, label: 'TaxGPT AI', path: '/taxgpt', badge: 'AI' },
  { icon: Receipt, label: 'Receipts & Mileage', path: '/receipts' },
  { icon: DollarSign, label: 'Quarterly Taxes', path: '/quarterly' },
  { icon: Building2, label: 'Business Entities', path: '/business-entities' },
  { icon: Bitcoin, label: 'Crypto Taxes', path: '/crypto' },
  { icon: Shield, label: 'Audit Defense', path: '/audit-defense' },
  { icon: FileText, label: 'E-File', path: '/efile' },
  { icon: Users, label: 'Remote Returns', path: '/remote-returns', badge: 'Human' },
  { icon: NotebookPen, label: 'Notary Services', path: '/notary' },
  { icon: Database, label: 'Backups', path: '/backups' },
  { icon: BookOpen, label: 'Academy', path: '/academy' },
  { icon: User, label: 'Profile', path: '/profile' },
];

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { user, loading, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading TaxFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-6 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Sign in to TaxFlow</h1>
            <p className="text-slate-400 text-sm">
              Access your year-round tax automation dashboard.
            </p>
          </div>
          <Button
            onClick={() => { window.location.href = getLoginUrl(); }}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            size="lg"
          >
            Sign In
          </Button>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? 'TF';

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 z-50",
          "fixed lg:relative h-full",
          sidebarOpen ? "w-64" : "w-16",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800 shrink-0">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-none">TaxFlow</p>
              <p className="text-emerald-400 text-xs mt-0.5">SmartBooks24</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto hidden lg:flex items-center justify-center w-6 h-6 text-slate-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.path || location.startsWith(item.path + '/');
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all group",
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 font-medium"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-emerald-400" : "")} />
                  {sidebarOpen && <span className="text-sm truncate">{item.label}</span>}
                  {!sidebarOpen && (
                    <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-slate-800 p-3 shrink-0">
          <div className={cn("flex items-center gap-3", !sidebarOpen && "justify-center")}>
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-slate-500 text-xs truncate">{user?.email}</p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={() => logout()}
                className="text-slate-500 hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 h-14 px-4 bg-slate-900 border-b border-slate-800 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-slate-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">TaxFlow</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
