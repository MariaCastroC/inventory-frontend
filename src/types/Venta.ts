import { MetodoPago } from "./MetodoPago";
import { Usuario } from "./Usuario";

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
}