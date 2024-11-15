// app/context/AuthContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextProps {
  isLoggedIn: boolean;
  isEmployeeLoggedIn: boolean;
  login: (userType: 'user' | 'employee') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEmployeeLoggedIn, setIsEmployeeLoggedIn] = useState(false);

  useEffect(() => {
    const userJson = sessionStorage.getItem('user');
    const employeeJson = sessionStorage.getItem('employee');
    setIsLoggedIn(!!userJson);
    setIsEmployeeLoggedIn(!!employeeJson);
  }, []);

  const login = (userType: 'user' | 'employee') => {
    if (userType === 'user') setIsLoggedIn(true);
    if (userType === 'employee') setIsEmployeeLoggedIn(true);
  };

  const logout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('employee');
    setIsLoggedIn(false);
    setIsEmployeeLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isEmployeeLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
