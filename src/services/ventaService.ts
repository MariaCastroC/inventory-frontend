import { axiosInstance } from '../utils/axiosInterceptor'; 
import { VentaRequest } from '../types/Venta'; 

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