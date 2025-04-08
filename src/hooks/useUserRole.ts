import { useEffect, useState } from 'react';
import { RoleType } from '../constants/roles';

interface DecodedToken {
  role?: RoleType;
  sub?: string;
  iat?: number;
  exp?: number;
}

const parseJwt = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn('Invalid token', e);
    return null;
  }
};

const useUserRole = () => {
  const [userRole, setUserRole] = useState<RoleType | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        const decoded = parseJwt(token);
        if (decoded && decoded.role) {
            setUserRole(decoded.role);
        } else {
            console.error("Token invalido o rol no encontrado en el token")
        }
    } else {
        console.warn('No se encontró token en el almacenamiento local.');
    }
    setIsLoadingRole(false);
  }, []);

  return { userRole, isLoadingRole };
};

export default useUserRole;