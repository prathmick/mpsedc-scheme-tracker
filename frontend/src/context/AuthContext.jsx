import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

function isTokenExpired(payload) {
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // On mount, restore from localStorage with expiry check
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const payload = decodeToken(storedToken);
      if (payload && !isTokenExpired(payload)) {
        setToken(storedToken);
        setUser(payload);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  function login(newToken) {
    const payload = decodeToken(newToken);
    if (!payload || isTokenExpired(payload)) return;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(payload);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
