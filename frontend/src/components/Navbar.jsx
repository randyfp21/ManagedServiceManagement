import React from 'react';
import { Menu, Moon, Sun, ShieldCheck, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function Navbar({
  onMenuClick,
  sidebarCollapsed,
  onToggleCollapse,
  theme,
  toggleTheme,
  pageTitle,
}) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left Side: Sidebar Toggle Button & Page Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Drawer Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Buka Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop Sidebar Hide/Show Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center gap-1.5 p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all"
            title={sidebarCollapsed ? 'Tampilkan Sidebar' : 'Sembunyikan Sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
            ) : (
              <PanelLeftClose className="h-4.5 w-4.5 text-slate-500" />
            )}
            <span className="text-xs font-semibold hidden xl:inline">
              {sidebarCollapsed ? 'Tampilkan Sidebar' : 'Hide Sidebar'}
            </span>
          </button>

          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {pageTitle || 'Dashboard'}
            </h2>
          </div>
        </div>

        {/* Right Side: Currency Indicator & Theme Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Currency: IDR (Rp)</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all duration-200"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4.5 w-4.5 text-amber-400" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
