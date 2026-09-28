import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sun, Moon, Bell, Search, User as UserIcon, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/apiClient';
import { NotificationDto } from '../../types';

interface HeaderProps {
  onSearch?: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications if logged in
  const { data: notifications = [] } = useQuery<NotificationDto[]>({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data } = await apiClient.get<NotificationDto[]>('/api/users/notifications');
      return data;
    },
    enabled: !!user,
    refetchInterval: 15000, // Poll every 15s
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between px-8 sticky top-0 z-20 transition-all duration-300">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-96 max-w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          placeholder="Search by city, state, PIN, or station..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (onSearch) onSearch(e.target.value); // Real-time search
          }}
          className="w-full pl-11 pr-4 py-2 text-sm rounded-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 border border-slate-200/50 dark:border-slate-700/50 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer border border-slate-200/20"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer relative border border-slate-200/20"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 border border-white dark:border-slate-800 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Alerts & Notifications</h3>
                  <span className="text-xs text-slate-400">{unreadCount} Unread</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 px-4 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-slate-50 dark:border-slate-800/30 text-left transition-colors ${
                          !n.isRead ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''
                        }`}
                      >
                        <p className="font-semibold text-xs text-slate-800 dark:text-slate-100 flex items-center justify-between">
                          <span>{n.title}</span>
                          {!n.isRead && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Badge */}
        {user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-100 dark:border-slate-800">
            <div className="text-right">
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{user.username}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {user.role === 'ROLE_ADMIN' ? 'ADMINISTRATOR' : 'EV DRIVER'}
              </p>
            </div>
            <img
              src={user.profilePicture}
              alt="avatar"
              className="w-9 h-9 rounded-full border-2 border-emerald-500/20 bg-slate-100 dark:bg-slate-800"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <UserIcon className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
