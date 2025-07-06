import { axiosInstance } from '../utils/axiosInterceptor'; 
import { VentaRequest } from '../types/Venta'; 

/**
 * Obtiene una lista paginada de ventas desde el backend.
 * @param page El número de página 
 * @param size El tamaño de la página.
 * @param nombreCliente Un nombre de cliente opcional para filtrar las ventas.
 */
const getVentas = async (page: number, size: number, nombreCliente?: string) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());

  if (nombreCliente) {
      params.append('nombreCliente', nombreCliente);
  }

  const response = await axiosInstance.get('/ventas', { params });
  return response.data;
};

const registrarVenta = async (ventaData: VentaRequest): Promise<any> => { 
  try {
    const response = await axiosInstance.post('/ventas', ventaData); 
    return response.data;
  } catch (error) {
    console.error('Error al registrar la venta:', error);
    throw error;
  }
};

const anularVenta = async (id: string, observacion: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.put<boolean>(`/ventas/${id}/anular`, {observacion});
    return response.data;
  } catch (error) {
    console.error(`Error al anular la venta con ID ${id}:`, error);
    throw error;
  }
};

const ventaService = {
  getVentas,
  registrarVenta,
  anularVenta,
};

export default ventaService;