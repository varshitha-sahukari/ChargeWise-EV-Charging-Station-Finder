import React from 'react';
import { NavLink } from 'react-router-dom';
import { Map, Route, Sparkles, BarChart2, User, ShieldAlert, Zap, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onSOSClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSOSClick }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Interactive Map', icon: Map },
    { to: '/routes', label: 'Route Planner', icon: Route },
    { to: '/recommendations', label: 'AI Recommend', icon: Sparkles },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/profile', label: 'User Profile', icon: User },
  ];

  if (user?.role === 'ROLE_ADMIN') {
    navItems.push({ to: '/admin', label: 'Admin Panel', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-30 transition-all duration-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Zap className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-lg leading-none bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-green-300">
              ChargeWise
            </h1>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">India</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shadow-sm border-l-4 border-emerald-500'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* SOS and Logout Footer */}
      <div className="p-4 border-t border-slate-50 dark:border-slate-800/50 space-y-3">
        {/* Emergency SOS Button */}
        <button
          onClick={onSOSClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm shadow-lg shadow-red-500/10 hover:shadow-red-500/25 active:scale-95 transition-all duration-150 cursor-pointer"
        >
          <ShieldAlert className="w-5 h-5 animate-bounce" />
          <span>EMERGENCY SOS</span>
        </button>

        {user && (
          <button
            onClick={logout}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 font-medium text-sm transition-all cursor-pointer"
          >
            <span className="flex items-center gap-3">
              <LogOut className="w-4 h-4" />
              Log Out
            </span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
