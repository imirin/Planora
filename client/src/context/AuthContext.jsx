import { createContext, useState, useContext, useEffect }from'react';

const AuthContext = createContext();

export const useAuth = () => {
 const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
 return context;
};

export const AuthProvider= ({ children }) => {
 const [user, setUser] = useState(null);
 const [token, setToken] = useState(localStorage.getItem('token'));
 const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
   const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
       const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
       console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

 const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

 const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

 const value = {
    user,
    token,
    loading,
    login,
    logout,
    setLoading
  };

 return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
