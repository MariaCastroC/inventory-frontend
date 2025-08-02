import { axiosInstance } from '../utils/axiosInterceptor'; // Ajusta la ruta si es necesario
import { MetodoPago } from '../types/MetodoPago'; // Ajusta la ruta si es necesario

const getAllMetodosPago = async (): Promise<MetodoPago[]> => {
  try {
    const response = await axiosInstance.get<MetodoPago[]>('/metodos-pago');
    return response.data || []; 
  } catch (error) {
    console.error('Error al obtener los métodos de pago:', error);
    throw error; 
  }
};

const metodoPagoService = {
  getAllMetodosPago,
};
export default metodoPagoService;