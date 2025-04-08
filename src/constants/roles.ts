export const ROLES = {
    ADMIN: 'ADMIN',
    VENTAS: 'VENTAS',
    COMPRAS: 'COMPRAS',
  } as const;
  
  export type RoleType = (typeof ROLES)[keyof typeof ROLES];