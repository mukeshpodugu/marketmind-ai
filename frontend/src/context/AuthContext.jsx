import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore authentication from localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedRole = localStorage.getItem('role');

    if (savedToken && savedUser && savedRole) {
      setToken(savedToken);
      setUser({ username: savedUser, role: savedRole });
    }
    setLoading(false);
  }, []);

  const login = (jwtToken, username, role) => {
    setToken(jwtToken);
    setUser({ username, role });
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', username);
    localStorage.setItem('role', role);
  };

  const registerGuest = () => {
    // Session-only guest user setup
    const guestUser = { username: 'Guest_' + Math.floor(Math.random() * 1000), role: 'guest' };
    setUser(guestUser);
    setToken('guest_token');
    localStorage.setItem('user', guestUser.username);
    localStorage.setItem('role', guestUser.role);
    localStorage.setItem('token', 'guest_token');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, registerGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
