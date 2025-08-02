import { axiosInstance } from '../utils/axiosInterceptor';
import { Usuario } from '../types/Usuario';
import { ROLES } from '../constants/roles';

const getUsuarios = async (page: number, size: number, nombre: string): Promise<any> => {
    try {
        const response = await axiosInstance.get('/usuarios', {
            params: {
                page: page,
                size: size,
                nombre: nombre,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw error;
    }
};

const getUsuarioById = async (id: string): Promise<Usuario> => {
    try {
        const response = await axiosInstance.get<Usuario>(`/usuarios/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener el usuario con ID ${id}:`, error);
        throw error;
    }
};

const getProveedores = async (): Promise<Usuario[]> => {
    try {

        const response = await axiosInstance.get<Usuario[]>('/usuarios/proveedores/all');
        return response.data;
    } catch (error) {
        console.error(`Error al obtener usuarios con rol ${ROLES.PROVEEDOR}:`, error);
        throw error;
    }
};

const getProveedoresByFilters = async (numeroDocumento?: number, nombre?: string): Promise<Usuario[]> => {
    try {
        const params: any = {};
        if (numeroDocumento !== undefined) {
            params.numeroDocumento = numeroDocumento;
        }
        if (nombre) {
            params.nombre = nombre;
        }
        
        const response = await axiosInstance.get<Usuario[]>('/usuarios/proveedores', { params });
        return response.data;
    } catch (error) {
        console.error(`Error al obtener usuarios con rol ${ROLES.PROVEEDOR}:`, error);
        throw error;
    }
};

const getClientes = async (numeroDocumento?: number, nombre?: string): Promise<Usuario[]> => {
    try {
        const params: any = {};
        if (numeroDocumento !== undefined) {
            params.numeroDocumento = numeroDocumento;
        }
        if (nombre) {
            params.nombre = nombre;
        }
        const response = await axiosInstance.get<Usuario[]>('/usuarios/clientes', { params });
        return response.data;
    } catch (error) {
        console.error(`Error al obtener usuarios con rol ${ROLES.CLIENTE}:`, error);
        throw error;
    }
};

const createUsuario = async (usuario: Usuario): Promise<Usuario> => {
    try {
        const response = await axiosInstance.post('/usuarios', usuario);
        return response.data;
    } catch (error) {
        console.error('Error al crear usuario:', error);
        throw error;
    }
};

const updateUsuario = async (id: string, usuario: Usuario): Promise<Usuario> => {
    try {
        const response = await axiosInstance.put(`/usuarios/${id}`, usuario);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        throw error;
    }
};

const deleteUsuario = async (id: string): Promise<void> => {
    try {
        await axiosInstance.delete(`/usuarios/${id}`);
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        throw error;
    }
};

const updateUsuarioPassword = async (id: string, password: string): Promise<void> => {
    try {
        await axiosInstance.put(`/usuarios/${id}/password`, { password });
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        throw error;
    }
};

const usuarioService = {
    getUsuarios,
    getUsuarioById,
    getProveedores,
    getClientes,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    updateUsuarioPassword,
    getProveedoresByFilters
};

export default usuarioService;
