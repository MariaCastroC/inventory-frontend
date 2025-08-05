import { axiosInstance } from '../utils/axiosInterceptor';
import { Producto } from '../types/Producto';

export interface ProductoPayload {
  idProducto?: string;
  codigo?: number;
  nombre: string;
  descripcion?: string;
  precioUnitarioVenta: number;
  precioUnitarioProveedor: number;
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

const searchProductosSimple = async (codigo?: number, nombre?: string): Promise<Producto[]> => {
  try {
    const params: any = {};
    if (codigo) {
      params.codigo = codigo;
    }
    if (nombre) {
      params.nombre = nombre;
    }
    const response = await axiosInstance.get<Producto[]>('/productos/all', { params });
    return response.data || []; // Devolver array vacío si no hay datos (ej. 204 No Content)
  } catch (error) {
    console.error('Error al buscar productos (simple):', error);
    return [];
  }
};

const searchProductosByProveedor = async (idProveedor: string, codigo?: number, nombre?: string): Promise<Producto[]> => {

  try {

    const params: any = {};
    // if ( idProveedor ) {
    //   params.id = idProveedor;
    // }
    if (codigo) {
      params.codigo = codigo;
    }
    if (nombre) {
      params.nombre = nombre;
    }

    const response = await axiosInstance.get<Producto[]>(`/productos/proveedor/${idProveedor}`, { params });
    return response.data || []; // Devolver array vacío si no hay datos (ej. 204 No Content)
  } catch (error) {
    console.error('Error al buscar productos del proveedor:', error);
    return [];
  }
};

const getProductosLowestStock = async (): Promise<Producto[]> => {
  try {
    const response = await axiosInstance.get<Producto[]>('/productos/lowest-stock');
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};



const productoService = {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  searchProductosSimple,
  searchProductosByProveedor,
  getProductosLowestStock
};

export default productoService;