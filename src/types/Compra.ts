import { MetodoPago } from "./MetodoPago";
import { Producto } from "./Producto";
import { Usuario } from "./Usuario";

export interface DetalleCompra {
  cantidad: number;
  precioUnitario: number;
  producto: Producto;
}

export interface ProductoCompraRequest {
  idProducto: string;
  cantidad: number;
  precioUnitarioCompra: number;
}

export interface CompraRequest {
  idProveedor: string;
  idMetodoPago: string;
  productos: ProductoCompraRequest[];
}

export interface Compra {
  idCompra: string;
  fechaCompra: string;
  subtotal: number;
  total: number;
  cliente: Usuario;
  proveedor: Usuario;
  metodoPago: MetodoPago;
  detallesCompra: DetalleCompra[];
}

export interface CompraResponseDTO {
  idCompra: string;
  fechaCompra: string;
  subtotal: number;
  total: number;
  nombreCliente: string;
  nombreProveedor: string;
  metodoPago: string;
  estado: string;
  observacion: string;
  numeroFacturaProveedor: string;
  otrosDetalles: string;
}


// Representa el objeto ProductoDTO que viene dentro del detalle
export interface ProductoDetalleDTO {
  idProducto: string;
  nombre: string;
}

/**
 * Representa la estructura de un detalle de compra que se recibe del API.
 * Coincide con la clase DetalleCompraResponseDTO de Spring Boot.
 */
export interface DetalleCompraDto {
  idDetalleCompra: string;
  cantidad: number;
  precioUnitarioProveedor: number;
  producto: ProductoDetalleDTO;
}