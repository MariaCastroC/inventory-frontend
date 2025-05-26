export const ROLES = {
    ADMIN: 'ADMIN',
    VENTAS: 'VENTAS',
    COMPRAS: 'COMPRAS',
    PROVEEDOR: 'PROVEEDOR',
    CLIENTE: 'CLIENTE',
  } as const;
  
  export type RoleType = (typeof ROLES)[keyof typeof ROLES];