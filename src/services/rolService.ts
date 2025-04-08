import { axiosInstance } from '../utils/axiosInterceptor';
import { Rol } from '../types/Rol';

const getRoles = async (): Promise<Rol[]> => {
    try {
        const response = await axiosInstance.get('/roles');
        return response.data;
    } catch (error) {
        console.error('Error al obtener roles:', error);
        throw error;
    }
};

const rolService = {
    getRoles,
};

export default rolService;