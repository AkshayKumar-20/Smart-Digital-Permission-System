import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const storedUser  = JSON.parse(localStorage.getItem('userInfo')) || null;
  const storedToken = localStorage.getItem('token') || null;

  const [user,  setUser]  = useState(storedUser);
  const [token, setToken] = useState(storedToken);

  const login = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    localStorage.setItem('token', jwt);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);