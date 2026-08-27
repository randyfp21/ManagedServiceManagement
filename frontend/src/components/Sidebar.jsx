import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Building2,
  CalendarDays,
  TrendingUp,
  FileSpreadsheet,
  Clock,
  History,
  LogOut,
  X,
  Layers,
  ChevronRight,
  PanelLeftClose
} from 'lucide-react';
import { logout, getUser } from '../utils/api';

const navItemsTop = [
  { path: '/', label: 'Dashboard Overview', icon: LayoutDashboard },
  { path: '/revenue', label: 'Revenue & Profitability', icon: TrendingUp },
  { path: '/summary', label: 'Monthly Summary', icon: CalendarDays },
  { path: '/timeline', label: 'On Bench', icon: Clock },
];

const navItemsBottom = [
  { path: '/employees', label: 'Master Data Employee', icon: Users },
  { path: '/groups', label: 'Master Data Group', icon: FolderGit2 },
  { path: '/customers', label: 'Master Data Customer', icon: Building2 },
  { path: '/personal-notes', label: 'Personal Notes', icon: FileSpreadsheet },
  { path: '/audit-logs', label: 'Audit Changes Logs', icon: History },
];

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavLink = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onClose}
        end={item.path === '/'}
        className={({ isActive }) =>
          `flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
            isActive
              ? 'bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`
        }
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110" />
          <span>{item.label}</span>
        </div>
        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex flex-col border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out shadow-lg lg:shadow-none ${
          isOpen
            ? 'translate-x-0'
            : isCollapsed
            ? '-translate-x-full'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight tracking-tight">
                RMS Manager
              </h1>
              <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Managed Services
              </span>
            </div>
          </div>

          {/* Desktop Collapse Sidebar Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Sembunyikan Sidebar"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Main Management
          </div>

          {navItemsTop.map(renderNavLink)}

          {/* Divider */}
          <div className="py-2">
            <hr className="border-t border-slate-200 dark:border-slate-800" />
          </div>

          {navItemsBottom.map(renderNavLink)}
        </div>

        {/* Footer User Profile & Logout */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/40">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                {user?.name ? user.name.charAt(0) : 'M'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {user?.name || 'Resource Manager'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.role || 'Manager'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
