import { axiosInstance } from '../utils/axiosInterceptor'; 
import { CompraRequest, DetalleCompraDto } from '../types/Compra';

/**
 * Obtiene una lista paginada de compras desde el backend.
 * @param page El número de página 
 * @param size El tamaño de la página.
 * @param nombreProveedor Un nombre de proveedor opcional para filtrar las compras.
 */
const getCompras = async (page: number, size: number, nombreProveedor?: string) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());

  if (nombreProveedor) {
      params.append('nombreProveedor', nombreProveedor);
  }

  const response = await axiosInstance.get('/compras', { params });
  return response.data;
};

/**
 * Obtiene los detalles (productos) de una compra específica.
 * @param compraId El ID de la compra de la cual se quieren obtener los detalles.
 * @returns Un array con los detalles de la compra.
 */
const getDetalleCompra = async (compraId: string): Promise<DetalleCompraDto[]> => {
  const response = await axiosInstance.get<DetalleCompraDto[]>(`/detalles-compra/compra/${compraId}`);
  return response.data;
};

const registrarCompra = async (compraData: CompraRequest): Promise<any> => { 
  try {
    const response = await axiosInstance.post('/compras', compraData); 
    return response.data;
  } catch (error) {
    console.error('Error al registrar la compra:', error);
    throw error;
  }
};

const anularCompra = async (id: string, observacion: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.put<boolean>(`/compras/${id}/anular`, {observacion});
    return response.data;
  } catch (error) {
    console.error(`Error al anular la compra con ID ${id}:`, error);
    throw error;
  }
};

const compraService = {
  getCompras,
  getDetalleCompra,
  registrarCompra,
  anularCompra,
};

export default compraService;