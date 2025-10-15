import { axiosInstance } from '../utils/axiosInterceptor'; 
import { DetalleVentaDto, VentaRequest } from '../types/Venta'; 
import { getCurrentDateFormatted } from '../utils/getCurrentDateFormatted';
import { downloadPDF } from '../utils/downloadPDF';


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

/**
 * Obtiene los detalles (productos) de una venta específica.
 * @param ventaId El ID de la venta de la cual se quieren obtener los detalles.
 * @returns Un array con los detalles de la venta.
 */
const getDetalleVenta = async (ventaId: string): Promise<DetalleVentaDto[]> => {
  const response = await axiosInstance.get<DetalleVentaDto[]>(`/detalles-venta/venta/${ventaId}`);
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

const generarFacturaVenta = async (id: string, customerName: string): Promise<string> => {
  try {

    const response = await axiosInstance.get(`/ventas/${id}/factura`, {
      responseType: "blob"
    });
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));

    const idVenta = id.split('-');
    const nombreClienteCleaned = customerName
      .normalize("NFD")                // separa las letras de los acentos
      .replace(/[\u0300-\u036f]/g, "") // elimina los diacríticos
      .replace(/[^\p{L}]+/gu, ""); // elimina todo lo que no sea letras

    const fechaActual = getCurrentDateFormatted();
    const nombrePDFFactura = `FV_${nombreClienteCleaned}_${fechaActual}_${idVenta[idVenta.length - 1]}.pdf`;

    downloadPDF(url, nombrePDFFactura);

    return url;

  } catch (error) {
    console.error(`Error al generar la factura de venta con ID ${id}`, error);
    throw error;
  }
}

const ventaService = {
  getVentas,
  getDetalleVenta,
  registrarVenta,
  anularVenta,
  generarFacturaVenta
};

export default ventaService;