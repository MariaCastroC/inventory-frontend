import { Categoria } from './Categoria';
import { Usuario } from './Usuario';

export interface Producto {
  idProducto?: string;
  codigo?: number; // Nuevo campo
  nombre: string;
  descripcion?: string;
  precioUnitario: number;
  categoria: Categoria;
  proveedor: Usuario;
  stock: number;
}