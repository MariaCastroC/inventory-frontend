export interface ProductoVentaRequest {
    idProducto: string;
    cantidad: number;
    precioUnitario: number; 
  }
  
  export interface VentaRequest {
    idCliente: string;
    idMetodoPago: string; 
    productos: ProductoVentaRequest[];
  }