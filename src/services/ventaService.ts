import { axiosInstance } from '../utils/axiosInterceptor'; // Ajusta la ruta si es necesario
import { VentaRequest } from '../types/Venta'; // Ajusta la ruta si es necesario
// Importa el tipo de respuesta de Venta si lo tienes definido, ej: import { Venta } from '../types/Venta';

const registrarVenta = async (ventaData: VentaRequest): Promise<any> => { 
  try {
    const response = await axiosInstance.post('/ventas', ventaData); 
    return response.data;
  } catch (error) {
    console.error('Error al registrar la venta:', error);
    throw error;
  }
};

const ventaService = {
  registrarVenta,
};

export default ventaService;