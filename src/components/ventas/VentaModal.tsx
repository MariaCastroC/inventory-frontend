import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, ListGroup, Spinner, Alert, Table, InputGroup, Row, Col } from 'react-bootstrap';
import { Usuario } from '../../types/Usuario';
import usuarioService from '../../services/usuarioService';
import { Producto } from '../../types/Producto'; // Importar tipo Producto
import productoService from '../../services/productoService'; // Importar servicio de Producto
import ventaService from '../../services/ventaService'; // Importar servicio de Venta
import metodoPagoService from '../../services/metodoPagoService'; // Importar servicio de MetodoPago
import { VentaRequest, ProductoVentaRequest, MetodoPago } from '../../types/Venta'; // Importar tipos de Venta y MetodoPago
import { debounce } from 'lodash'; // Necesitarás instalar lodash: npm install lodash @types/lodash
import Swal from 'sweetalert2';
interface VentaModalProps {
  show: boolean;
  onHide: () => void;
  onVentaCreada?: () => void; // Callback para refrescar la lista de ventas
}

const VentaModal: React.FC<VentaModalProps> = ({ show, onHide, onVentaCreada }) => {
  const [clienteNombreSearch, setClienteNombreSearch] = useState('');
  const [clienteDocumentoSearch, setClienteDocumentoSearch] = useState('');
  const [clientesSugeridos, setClientesSugeridos] = useState<Usuario[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Usuario | null>(null);
  const [isSearchingClientes, setIsSearchingClientes] = useState(false);
  const [clienteSearchError, setClienteSearchError] = useState<string | null>(null);

  // Estados para la búsqueda y adición de productos
  const [productoCodigoSearch, setProductoCodigoSearch] = useState('');
  const [productoNombreSearch, setProductoNombreSearch] = useState('');
  const [productosSugeridos, setProductosSugeridos] = useState<Producto[]>([]);
  const [isSearchingProductos, setIsSearchingProductos] = useState(false);
  const [productoSearchError, setProductoSearchError] = useState<string | null>(null);
  
  interface VentaProducto extends Producto { // Extender Producto para añadir cantidad en venta
    cantidadEnVenta: number;
  }
  const [productosEnVenta, setProductosEnVenta] = useState<VentaProducto[]>([]);
  const [totalVenta, setTotalVenta] = useState<number>(0);
  const [isSubmittingVenta, setIsSubmittingVenta] = useState(false);

  // Estados para métodos de pago
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [selectedMetodoPagoId, setSelectedMetodoPagoId] = useState<string>('');

  const debouncedSearchClientes = useCallback(
    debounce(async (nombre: string, documento: string) => {
      const trimmedNombre = nombre.trim();
      const trimmedDocumento = documento.trim();

      // No buscar si ambos campos están vacíos o si el nombre es demasiado corto y el documento está vacío
      if ((trimmedNombre === '' && trimmedDocumento === '') || (trimmedNombre.length > 0 && trimmedNombre.length < 2 && trimmedDocumento === '')) {
        setClientesSugeridos([]);
        setIsSearchingClientes(false);
        return;
      }

      setIsSearchingClientes(true);
      setClienteSearchError(null);
      try {
        let numeroDoc: number | undefined = undefined;
        if (trimmedDocumento !== '') {
          if (/^\d+$/.test(trimmedDocumento)) {
            numeroDoc = parseInt(trimmedDocumento, 10);
          } else {
            setClienteSearchError('El número de documento debe ser numérico.');
            setClientesSugeridos([]);
            setIsSearchingClientes(false);
            return;
          }
        }
        
        const data = await usuarioService.getClientes(numeroDoc, trimmedNombre || undefined);
        setClientesSugeridos(data);
      } catch (error) {
        console.error("Error buscando clientes:", error);
        setClienteSearchError('Error al buscar clientes. Intente de nuevo.');
        setClientesSugeridos([]);
      } finally {
        setIsSearchingClientes(false);
      }
    }, 500), // Espera 500ms después de que el usuario deja de escribir
    []
  );

  const debouncedSearchProductos = useCallback(
    debounce(async (codigo: string, nombre: string) => {
      const trimmedCodigo = codigo.trim();
      const trimmedNombre = nombre.trim();

      if (trimmedCodigo === '' && trimmedNombre.length < 3 && trimmedNombre !== '') { // Si solo hay nombre y es corto
        setProductosSugeridos([]);
        setIsSearchingProductos(false);
        return;
      }
      if (trimmedCodigo === '' && trimmedNombre === '') { // Si ambos están vacíos
        setProductosSugeridos([]);
        setIsSearchingProductos(false);
        return;
      }

      setIsSearchingProductos(true);
      setProductoSearchError(null);
      try {
        const data = await productoService.searchProductosSimple(trimmedCodigo || undefined, trimmedNombre || undefined);
        // Ya no filtramos aquí, el filtrado visual se hará en el renderizado
        setProductosSugeridos(data); 
      } catch (error) {
        console.error("Error buscando productos:", error);
        setProductoSearchError('Error al buscar productos. Intente de nuevo.');
        setProductosSugeridos([]);
      } finally {
        setIsSearchingProductos(false);
      }
    }, 500),
    []
  );

  // Fetch métodos de pago cuando el modal se muestra por primera vez o se vuelve a mostrar
  useEffect(() => {
    const fetchMetodosPago = async () => {
      if (show) { // Solo cargar si el modal está visible
        try {
          const data = await metodoPagoService.getAllMetodosPago();
          setMetodosPago(data);
        } catch (error) {
          Swal.fire('Error', 'No se pudieron cargar los métodos de pago.', 'error');
        }
      }
    };
    fetchMetodosPago();
  }, [show]);

  useEffect(() => {
    if ((clienteNombreSearch || clienteDocumentoSearch) && !selectedCliente) {
      debouncedSearchClientes(clienteNombreSearch, clienteDocumentoSearch);
    } else {
      setClientesSugeridos([]);
      if (!clienteNombreSearch && !clienteDocumentoSearch) setIsSearchingClientes(false);
    }
    return () => {
      debouncedSearchClientes.cancel(); // Limpiar el debounce si el componente se desmonta
    };
  }, [clienteNombreSearch, clienteDocumentoSearch, selectedCliente, debouncedSearchClientes]);

  useEffect(() => {
    if (productoCodigoSearch || productoNombreSearch) {
      debouncedSearchProductos(productoCodigoSearch, productoNombreSearch);
    } else {
      setProductosSugeridos([]);
    }
    return () => {
      debouncedSearchProductos.cancel();
    };
  }, [productoCodigoSearch, productoNombreSearch, debouncedSearchProductos]);


  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === 'clienteNombreSearch') {
      setClienteNombreSearch(value);
    } else if (name === 'clienteDocumentoSearch') {
      setClienteDocumentoSearch(value);
    }
    if(selectedCliente) setSelectedCliente(null); 
  };

  const handleSelectCliente = (cliente: Usuario) => {
    setSelectedCliente(cliente);
    setClientesSugeridos([]);
    setClienteNombreSearch(''); 
    setClienteDocumentoSearch('');
  };

  const handleClearSelectedCliente = () => {
    setSelectedCliente(null);
    setClienteNombreSearch('');
    setClienteDocumentoSearch('');
    // Opcional: dar foco de nuevo al input de búsqueda
  };

  const handleProductoSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === 'productoCodigoSearch') {
      setProductoCodigoSearch(value);
    } else if (name === 'productoNombreSearch') {
      setProductoNombreSearch(value);
    }
  };

  const handleAddProductoAVenta = (producto: Producto) => {
    const existente = productosEnVenta.find(p => p.idProducto === producto.idProducto);
    if (existente) {
      setProductoCodigoSearch('');
      setProductoNombreSearch('');
      setProductosSugeridos([]);
      Swal.fire('Aviso', 'El producto ya está en la lista. Puede modificar la cantidad.', 'info');
      return;
    }
    if (producto.stock <= 0) {
        Swal.fire('Sin Stock', 'Este producto no tiene stock disponible.', 'warning');
        return;
    }
    setProductosEnVenta(prev => [...prev, { ...producto, cantidadEnVenta: 1 }]);
    setProductoCodigoSearch('');
    setProductoNombreSearch('');
    setProductosSugeridos([]);
  };

  const handleRemoveProductoDeVenta = (idProducto?: string) => {
    if (!idProducto) return;
    setProductosEnVenta(prev => prev.filter(p => p.idProducto !== idProducto));
  };

  const handleCantidadProductoChange = (idProducto: string | undefined, nuevaCantidad: number) => {
    if (!idProducto) return;
    setProductosEnVenta(prev => prev.map(p => {
      if (p.idProducto === idProducto) {
        const cantidad = Math.max(1, Math.min(nuevaCantidad, p.stock));
        return { ...p, cantidadEnVenta: cantidad };
      }
      return p;
    }));
  };

  // Calcular el total de la venta cada vez que productosEnVenta cambie
  useEffect(() => {
    const nuevoTotal = productosEnVenta.reduce((sum, item) => {
      return sum + (item.cantidadEnVenta * item.precioUnitario);
    }, 0);
    setTotalVenta(nuevoTotal);
  }, [productosEnVenta]);

  const handleCrearVenta = async () => {
    if (!selectedCliente || !selectedCliente.idUsuario) {
      Swal.fire('Error', 'Debe seleccionar un cliente.', 'error');
      return;
    }
    if (productosEnVenta.length === 0) {
      Swal.fire('Error', 'Debe agregar al menos un producto a la venta.', 'error');
      return;
    }
    if (!selectedMetodoPagoId) {
      Swal.fire('Error', 'Debe seleccionar un método de pago.', 'error');
      return;
    }
    const productosDTO: ProductoVentaRequest[] = productosEnVenta.map(p => ({
      idProducto: p.idProducto!, // Aseguramos que idProducto no es undefined
      cantidad: p.cantidadEnVenta,
      precioUnitario: p.precioUnitario, // El precio al momento de agregarla a la venta
    }));

    const ventaData: VentaRequest = {
    
      idCliente: selectedCliente.idUsuario,
      idMetodoPago: selectedMetodoPagoId,
      productos: productosDTO,
    };

    setIsSubmittingVenta(true);
    try {
      await ventaService.registrarVenta(ventaData);
      Swal.fire('¡Venta Creada!', 'La venta ha sido registrada exitosamente.', 'success');
      onHide(); // Cerrar el modal
      onVentaCreada?.(); // Llamar al callback si existe para refrescar la lista de ventas
    } catch (error: any) {
      Swal.fire('Error', `Error al registrar la venta: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setIsSubmittingVenta(false);
    }
  };

  // Resetear el estado del modal cuando se cierra/abre
  useEffect(() => {
    if (!show) {
      setClienteNombreSearch('');
      setClienteDocumentoSearch('');
      setClientesSugeridos([]);
      setSelectedCliente(null);
      setIsSearchingClientes(false);
      setClienteSearchError(null);
      // Resetear también estados de productos
      setProductoCodigoSearch('');
      setProductoNombreSearch('');
      setProductosSugeridos([]);
      setProductosEnVenta([]);
      setIsSearchingProductos(false);
      setProductoSearchError(null);
      setTotalVenta(0); // Resetear total
      setIsSubmittingVenta(false);
      setSelectedMetodoPagoId(''); // Resetear método de pago seleccionado
      // No es necesario resetear metodosPago aquí, ya que se cargan al mostrar el modal
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Crear Nueva Venta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!selectedCliente ? (
          <>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formClienteDocumentoSearch">
                  <Form.Label>Buscar Cliente por N° Documento</Form.Label>
                  <Form.Control
                    type="text"
                    name="clienteDocumentoSearch"
                    placeholder="N° de documento"
                    value={clienteDocumentoSearch}
                    onChange={handleSearchInputChange}
                    autoFocus
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formClienteNombreSearch">
                  <Form.Label>o por Nombre (mín. 2 caracteres)</Form.Label>
                  <Form.Control
                    type="text"
                    name="clienteNombreSearch"
                    placeholder="Nombre del cliente"
                    value={clienteNombreSearch}
                    onChange={handleSearchInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {isSearchingClientes && <div className="text-center my-2"><Spinner animation="border" size="sm" /> Buscando clientes...</div>}
            {clienteSearchError && <Alert variant="danger" className="my-2">{clienteSearchError}</Alert>}
            {!isSearchingClientes && clientesSugeridos.length > 0 && (
              <ListGroup className="mb-3 shadow-sm" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {clientesSugeridos.map((cliente) => (
                  <ListGroup.Item
                    action
                    key={cliente.idUsuario}
                    onClick={() => handleSelectCliente(cliente)}
                  >
                    <strong>{cliente.nombre}</strong> ({cliente.tipoDocumento}: {cliente.numeroDocumento || 'N/A'})
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
            {!isSearchingClientes && 
             (clienteNombreSearch.length >= 2 || clienteDocumentoSearch.length > 0) && 
             clientesSugeridos.length === 0 && 
             !clienteSearchError && (
              <div className="text-muted my-2">No se encontraron clientes que coincidan con los criterios de búsqueda.</div>
            )}
          </>
        ) : (
          <div className="mb-3 p-3 border rounded bg-light">
            <h5>Cliente Seleccionado:</h5>
            <p className="mb-1">
              <strong>Nombre:</strong> {selectedCliente.nombre}
            </p>
            <p className="mb-2">
              <strong>Documento:</strong> {selectedCliente.tipoDocumento} - {selectedCliente.numeroDocumento || 'N/A'}
            </p>
            <Button variant="outline-secondary" size="sm" onClick={handleClearSelectedCliente}>
              Cambiar Cliente
            </Button>
          </div>
        )}

        <hr />
        {/* Aquí irá el resto del formulario para agregar productos a la venta */}
        {selectedCliente ? (
          <>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formProductoCodigoSearch">
                  <Form.Label>Buscar Producto por Código</Form.Label>
                  <Form.Control
                    type="text"
                    name="productoCodigoSearch"
                    placeholder="Código del producto"
                    value={productoCodigoSearch}
                    onChange={handleProductoSearchInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formProductoNombreSearch">
                  <Form.Label>o por Nombre (mín. 2 caracteres)</Form.Label>
                  <Form.Control
                    type="text"
                    name="productoNombreSearch"
                    placeholder="Nombre del producto"
                    value={productoNombreSearch}
                    onChange={handleProductoSearchInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {isSearchingProductos && <div className="text-center my-2"><Spinner animation="border" size="sm" /> Buscando productos...</div>}
            {productoSearchError && <Alert variant="danger" className="my-2">{productoSearchError}</Alert>}
            {!isSearchingProductos && productosSugeridos.length > 0 && (
              <ListGroup className="mb-3 shadow-sm" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {productosSugeridos.map((prod) => (
                  <ListGroup.Item
                    action
                    key={prod.idProducto}
                    onClick={() => handleAddProductoAVenta(prod)}
                    disabled={prod.stock <= 0}
                  >
                    <strong>{prod.nombre}</strong> (Código: {prod.codigo || 'N/A'}) - Precio: ${prod.precioUnitario.toFixed(2)} - Stock: {prod.stock}
                    {prod.stock <= 0 && <span className="text-danger ms-2">(Sin stock)</span>}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
            {!isSearchingProductos && (productoCodigoSearch || productoNombreSearch.length >=2 ) && productosSugeridos.length === 0 && !productoSearchError && (
              <div className="text-muted my-2">No se encontraron productos que coincidan con los criterios de búsqueda.</div>
            )}

            {productosEnVenta.length > 0 && (
              <>
                <h5 className="mt-4">Productos en esta Venta:</h5>
                <Table striped bordered hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Subtotal</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosEnVenta.map(item => (
                      <tr key={item.idProducto}>
                        <td>{item.nombre} ({item.codigo || 'N/A'})</td>
                        <td>
                          <Form.Control
                            type="number"
                            value={item.cantidadEnVenta}
                            onChange={(e) => handleCantidadProductoChange(item.idProducto, parseInt(e.target.value))}
                            min="1"
                            max={item.stock} 
                            size="sm"
                            style={{width: '80px'}}
                          />
                        </td>
                        <td>${item.precioUnitario.toFixed(2)}</td>
                        <td>${(item.cantidadEnVenta * item.precioUnitario).toFixed(2)}</td>
                        <td>
                          <Button variant="danger" size="sm" onClick={() => handleRemoveProductoDeVenta(item.idProducto)}>
                            Quitar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}
          </>
        ) : (
          <p className="text-muted">Seleccione un cliente para poder agregar productos a la venta.</p>
        )}

        {selectedCliente && productosEnVenta.length > 0 && (
          <>
            <hr />
            <Form.Group className="mb-3" controlId="formMetodoPago">
              <Form.Label>Método de Pago</Form.Label>
              <Form.Select value={selectedMetodoPagoId} onChange={(e) => setSelectedMetodoPagoId(e.target.value)} required>
                <option value="">Seleccione un método de pago</option>
                {metodosPago.map(metodo => (
                  <option key={metodo.idMetodoPago} value={metodo.idMetodoPago}>{metodo.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div className="me-auto">
          <h5>Total: ${totalVenta.toFixed(2)}</h5>
        </div>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleCrearVenta} disabled={!selectedCliente || isSearchingClientes || isSearchingProductos || productosEnVenta.length === 0 || !selectedMetodoPagoId || isSubmittingVenta}>
          {isSubmittingVenta ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Creando...</> : 'Crear Venta'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VentaModal;