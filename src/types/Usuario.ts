import { Rol } from "./Rol";

export enum TipoDocumento {
    CEDULA_CIUDADANIA = "CÉDULA DE CIUDADANÍA",
    PASAPORTE = "PASAPORTE"
}

export interface Usuario {
    idUsuario?: string;
    nombre: string;
    email: string;
    direccion?: string;
    telefono?: string;
    password?: string;
    rol: Rol;
    tipoDocumento?: TipoDocumento | string;
    numeroDocumento?: string;
}