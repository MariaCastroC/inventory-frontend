import { axiosInstance } from '../utils/axiosInterceptor';
import { Usuario } from '../types/Usuario';

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
    createUsuario,
    updateUsuario,
    deleteUsuario,
    updateUsuarioPassword
};

export default usuarioService;
