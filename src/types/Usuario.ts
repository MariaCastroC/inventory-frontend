import { Rol } from "./Rol";

export interface Usuario {
    idUsuario?: string; // UUID (Opcional para creación)
    nombre: string;
    direccion?: string; // Opcional
    telefono?: string; // Opcional
    email: string;
    password: string; // Obligatorio, solo para creación o cambio de contraseña
    rol: Rol;
}