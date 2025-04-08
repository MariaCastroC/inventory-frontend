import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextProps {
  token: string | null;
  setToken: (token: string | null) => void;
  isLoggedIn: boolean;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const AuthContext = createContext<AuthContextProps>({
  token: null,
  setToken: () => {},
  isLoggedIn: false,
  isLoading: true,
  setIsLoading: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
    children: ReactNode;
}
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!token);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);

  useEffect(() => {
    setIsLoggedIn(!!token);
    if(isFirstLoad){
        setIsLoading(false);
        setIsFirstLoad(false);
    }
  }, [token, isFirstLoad]);

  const handleSetToken = (newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  };

  return (
    <AuthContext.Provider value={{ token, setToken: handleSetToken, isLoggedIn, isLoading, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
