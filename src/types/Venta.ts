import { MetodoPago } from "./MetodoPago";
import { Producto } from "./Producto";
import { Usuario } from "./Usuario";

export interface DetalleVenta {
  idDetalleVenta: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
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
}