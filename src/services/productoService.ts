import { axiosInstance } from '../utils/axiosInterceptor';
import { Producto } from '../types/Producto';

export interface ProductoPayload {
  idProducto?: string;
  codigo?: string; 
  nombre: string;
  descripcion?: string;
  precioUnitario: number;
  stock: number;
  categoria: { idCategoria: string };
  proveedor: { idUsuario: string };
}

interface PaginatedProductosResponse {
  content: Producto[];
  totalPages: number;
}

const getProductos = async (page: number, size: number, nombre?: string, idCategoria?: string): Promise<PaginatedProductosResponse> => {
  try {
    const response = await axiosInstance.get<PaginatedProductosResponse>('/productos', {
      params: {
        page,
        size,
        nombre: nombre || undefined,
        idCategoria: idCategoria || undefined,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

const createProducto = async (productoData: ProductoPayload): Promise<Producto> => {
  try {
    const response = await axiosInstance.post<Producto>('/productos', productoData);
    return response.data;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

const updateProducto = async (id: string, productoData: ProductoPayload): Promise<Producto> => {
  try {
    const response = await axiosInstance.put<Producto>(`/productos/${id}`, productoData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
};

const deleteProducto = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/productos/${id}`);
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw error;
  }
};

const productoService = {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
};

export default productoService;