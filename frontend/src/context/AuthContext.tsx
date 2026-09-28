import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { AuthRequest, AuthResponse, RegisterRequest, UserDto } from '../types'; // we will define types next

interface AuthContextType {
  user: UserDto | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: AuthRequest) => Promise<void>;
  registerUser: (details: RegisterRequest) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async () => {
    try {
      const { data } = await apiClient.get<UserDto>('/api/users/profile');
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (err) {
      logOutAction();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');

    if (token) {
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setLoading(false);
        // Silently update profile in background
        loadUserProfile();
      } else {
        loadUserProfile();
      }
    } else {
      setLoading(false);
    }

    // Handle token expiration/revocation events from interceptors
    const handleLogoutEvent = () => {
      logOutAction();
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, []);

  const saveTokensAndUser = (data: AuthResponse) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    const userProfile: UserDto = {
      id: data.userId,
      email: data.email,
      username: data.username,
      role: data.role,
      profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      emailVerified: true
    };
    setUser(userProfile);
    localStorage.setItem('user', JSON.stringify(userProfile));
  };

  const login = async (credentials: AuthRequest) => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    saveTokensAndUser(data);
  };

  const registerUser = async (details: RegisterRequest) => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/register', details);
    saveTokensAndUser(data);
  };

  const googleLogin = async (token: string) => {
    const { data } = await apiClient.post<AuthResponse>('/api/auth/google', { token });
    saveTokensAndUser(data);
  };

  const logOutAction = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const logout = () => {
    logOutAction();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, registerUser, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
