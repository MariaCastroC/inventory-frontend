import { MetodoPago } from "./MetodoPago";
import { Producto } from "./Producto";
import { Usuario } from "./Usuario";

export interface DetalleVenta {
  cantidad: number;
  precioUnitario: number;
  producto: Producto;
}

export interface ProductoVentaRequest {
  idProducto: string;
  cantidad: number;
  precioUnitarioVenta: number;
}

export interface VentaRequest {
  idCliente: string;
  idMetodoPago: string;
  productos: ProductoVentaRequest[];
}

export interface Venta {
  idVenta: string;
  fechaVenta: string;
  subtotal: number;
  total: number;
  vendedor: Usuario;
  cliente: Usuario;
  metodoPago: MetodoPago;
  detallesVenta: DetalleVenta[];
}

export interface VentaResponseDTO {
  idVenta: string;
  fechaVenta: string;
  subtotal: number;
  total: number;
  nombreCliente: string;
  nombreVendedor: string;
  metodoPago: string;
  estado: string;
}

// Representa el objeto ProductoDTO que viene dentro del detalle
export interface ProductoDetalleDTO {
  idProducto: string;
  nombre: string;
}

/**
 * Representa la estructura de un detalle de venta que se recibe del API.
 * Coincide con la clase DetalleVentaResponseDTO de Spring Boot.
 */
export interface DetalleVentaDto {
  idDetalleVenta: string;
  cantidad: number;
  precioUnitarioVenta: number;
  producto: ProductoDetalleDTO;
}