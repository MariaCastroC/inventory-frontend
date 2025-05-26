import { axiosInstance } from '../utils/axiosInterceptor';
import { Categoria } from '../types/Categoria';

interface PaginatedCategoriasResponse {
  content: Categoria[];
  totalPages: number;
}

const getCategorias = async (page: number, size: number, nombre?: string): Promise<PaginatedCategoriasResponse> => {
  try {
    const response = await axiosInstance.get<PaginatedCategoriasResponse>('/categorias', {
      params: {
        page: page, // Ajustar si tu API espera paginación basada en 0
        size: size,
        nombre: nombre || undefined, // Enviar solo si tiene valor
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
};

const getAllCategorias = async (): Promise<Categoria[]> => {
  try {
    const response = await axiosInstance.get<Categoria[]>('/categorias/all');
    return response.data || [];
  } catch (error) {
    console.error('Error al obtener todas las categorías:', error);
    throw error;
  }
};

const createCategoria = async (categoria: Categoria): Promise<Categoria> => {
  try {
    const response = await axiosInstance.post<Categoria>('/categorias', categoria);
    return response.data;
  } catch (error) {
    console.error('Error al crear categoría:', error);
    throw error;
  }
};

const updateCategoria = async (id: string, categoria: Categoria): Promise<Categoria> => {
  try {
    const response = await axiosInstance.put<Categoria>(`/categorias/${id}`, categoria);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    throw error;
  }
};

const deleteCategoria = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/categorias/${id}`);
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    throw error;
  }
};

const categoriaService = {
  getCategorias,
  getAllCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
};

export default categoriaService;