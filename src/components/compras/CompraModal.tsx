import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, ListGroup, Spinner, Alert, Table, Row, Col } from 'react-bootstrap';

import { Usuario } from '../../types/Usuario'; // Importar tipos de Usuario
import { Producto } from '../../types/Producto'; // Importar tipos de Producto
import { MetodoPago } from '../../types/MetodoPago'; // Importar tipos de MetodoPago
import {
  CompraRequest,
  ProductoCompraRequest,
} from '../../types/Compra'; // Importar tipos de Compra

import usuarioService from '../../services/usuarioService'; // Importar servicio de Compra
import productoService from '../../services/productoService'; // Importar servicio de Producto
import metodoPagoService from '../../services/metodoPagoService'; // Importar servicio de MetodoPago

import { debounce } from 'lodash'; // Necesitarás instalar lodash: npm install lodash @types/lodash
import Swal from 'sweetalert2';
import compraService from '../../services/compraService';

interface CompraModalProps {
  show: boolean;
  onHide: () => void;
  onCompraUpdated?: () => void; // Callback para refrescar la lista de compras
}

const CompraModal: React.FC<CompraModalProps> = ({ show, onHide, onCompraUpdated }) => {

  const [proveedorNombreSearch, setProveedorNombreSearch] = useState('');
  const [proveedorDocumentoSearch, setProveedorDocumentoSearch] = useState('');
  const [proveedoresSugeridos, setProveedoresSugeridos] = useState<Usuario[]>([]);
  const [selectedProveedor, setSelectedProveedor] = useState<Usuario | null>(null);
  const [isSearchingProveedores, setIsSearchingProveedores] = useState(false);
  const [proveedorSearchError, setProveedorSearchError] = useState<string | null>(null);

  // Estados para la búsqueda y adición de productos
  const [productoCodigoSearch, setProductoCodigoSearch] = useState('');
  const [productoNombreSearch, setProductoNombreSearch] = useState('');
  const [productosSugeridos, setProductosSugeridos] = useState<Producto[]>([]);
  const [isSearchingProductos, setIsSearchingProductos] = useState(false);
  const [productoSearchError, setProductoSearchError] = useState<string | null>(null);

  interface CompraProducto extends Producto { // Extender Producto para añadir cantidad en compra
    cantidadEnCompra: number;
  }
  const [productosAComprar, setProductosAComprar] = useState<CompraProducto[]>([]);
  const [totalCompra, setTotalCompra] = useState<number>(0);
  const [isSubmittingCompra, setIsSubmittingCompra] = useState(false);

  // Estados para métodos de pago
  // const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [selectedMetodoPagoId, setSelectedMetodoPagoId] = useState<string>('');

  const debouncedSearchProveedores = useCallback(
    debounce(async (nombre: string, documento: string) => {
      const trimmedNombre = nombre.trim();
      const trimmedDocumento = documento.trim();

      // No buscar si ambos campos están vacíos o si el nombre es demasiado corto y el documento está vacío
      if ((trimmedNombre === '' && trimmedDocumento === '') || (trimmedNombre.length > 0 && trimmedNombre.length < 2 && trimmedDocumento === '')) {
        setProveedoresSugeridos([]);
        setIsSearchingProveedores(false);
        return;
      }

      setIsSearchingProveedores(true);
      setProveedorSearchError(null);
      try {
        let numeroDoc: number | undefined = undefined;
        if (trimmedDocumento !== '') {
          if (/^\d+$/.test(trimmedDocumento)) {
            numeroDoc = parseInt(trimmedDocumento, 10);
          } else {
            setProveedorSearchError('El número de documento debe ser numérico.');
            setProveedoresSugeridos([]);
            setIsSearchingProveedores(false);
            return;
          }
        }

        const data = await usuarioService.getProveedoresByFilters(numeroDoc, trimmedNombre || undefined);
        setProveedoresSugeridos(data);

      } catch (error) {
        console.error("Error buscando proveedores:", error);
        setProveedorSearchError('Error al buscar proveedores. Intente de nuevo.');
        setProveedoresSugeridos([]);
      } finally {
        setIsSearchingProveedores(false);
      }
    }, 500), // Espera 500ms después de que el usuario deja de escribir
    []
  );

  const debouncedSearchProductos = useCallback(
    debounce(async (codigo: string, nombre: string, idProveedor?: string) => {
      const trimmedCodigo = codigo.trim();
      const trimmedNombre = nombre.trim();

      if (!idProveedor) return;

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

        const data = await productoService.searchProductosByProveedor(
          idProveedor,
          trimmedCodigo || undefined,
          trimmedNombre || undefined
        );
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
    if ((proveedorNombreSearch || proveedorDocumentoSearch) && !selectedProveedor) {
      debouncedSearchProveedores(proveedorNombreSearch, proveedorDocumentoSearch);
    } else {
      setProveedoresSugeridos([]);
      if (!proveedorNombreSearch && !proveedorDocumentoSearch) setIsSearchingProveedores(false);
    }
    return () => {
      debouncedSearchProveedores.cancel(); // Limpiar el debounce si el componente se desmonta
    };
  }, [proveedorNombreSearch, proveedorDocumentoSearch, selectedProveedor, debouncedSearchProveedores]);

  useEffect(() => {
    if ((productoCodigoSearch || productoNombreSearch)) {
      debouncedSearchProductos(productoCodigoSearch, productoNombreSearch, selectedProveedor?.idUsuario);
    } else {
      setProductosSugeridos([]);
    }
    return () => {
      debouncedSearchProductos.cancel();
    };
  }, [productoCodigoSearch, productoNombreSearch, debouncedSearchProductos]);


  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === 'proveedorNombreSearch') {
      setProveedorNombreSearch(value);
    } else if (name === 'proveedorDocumentoSearch') {
      setProveedorDocumentoSearch(value);
    }
    if (selectedProveedor) setSelectedProveedor(null);
  };

  const handleSelectProveedor = (proveedor: Usuario) => {
    setSelectedProveedor(proveedor);
    setProveedoresSugeridos([]);
    setProveedorNombreSearch('');
    setProveedorDocumentoSearch('');
  };

  const handleClearSelectedProveedor = () => {
    setSelectedProveedor(null);
    setProveedorNombreSearch('');
    setProveedorDocumentoSearch('');
    setProductosAComprar([]);
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

  const handleAddProductoACompra = (producto: Producto) => {
    const existente = productosAComprar.find(p => p.idProducto === producto.idProducto);
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
    setProductosAComprar(prev => [...prev, { ...producto, cantidadEnCompra: 1 }]);
    setProductoCodigoSearch('');
    setProductoNombreSearch('');
    setProductosSugeridos([]);
  };

  const handleRemoveProductoDeCompra = (idProducto?: string) => {
    if (!idProducto) return;
    setProductosAComprar(prev => prev.filter(p => p.idProducto !== idProducto));
  };

  const handleCantidadProductoChange = (idProducto: string | undefined, nuevaCantidad: number) => {
    if (!idProducto) return;
    setProductosAComprar(prev => prev.map(p => {
      if (p.idProducto === idProducto) {
        const cantidad = Math.max(1, Math.min(nuevaCantidad, p.stock));
        return { ...p, cantidadEnCompra: cantidad };
      }
      return p;
    }));
  };

  // Calcular el total de la compra cada vez que productosAComprar cambie
  useEffect(() => {
    const nuevoTotal = productosAComprar.reduce((sum, item) => {
      return sum + (item.cantidadEnCompra * item.precioUnitarioProveedor);
    }, 0);
    setTotalCompra(nuevoTotal);
  }, [productosAComprar]);

  const handleCrearCompra = async () => {
    if (!selectedProveedor || !selectedProveedor.idUsuario) {
      Swal.fire('Error', 'Debe seleccionar un proveedor.', 'error');
      return;
    }
    if (productosAComprar.length === 0) {
      Swal.fire('Error', 'Debe agregar al menos un producto a la compra.', 'error');
      return;
    }
    if (!selectedMetodoPagoId) {
      Swal.fire('Error', 'Debe seleccionar un método de pago.', 'error');
      return;
    }

    const productosDTO: ProductoCompraRequest[] = productosAComprar.map(p => ({
      idProducto: p.idProducto!, // Aseguramos que idProducto no es undefined
      cantidad: p.cantidadEnCompra,
      precioUnitarioCompra: p.precioUnitarioProveedor, // El precio del producto al momento de realizar compra al proveedor
    }));

    const compraData: CompraRequest = {
      idProveedor: selectedProveedor.idUsuario,
      idMetodoPago: selectedMetodoPagoId,
      productos: productosDTO,
    };

    setIsSubmittingCompra(true);
    try {

      await compraService.registrarCompra(compraData);
      Swal.fire('Compra Creada!', 'La compra ha sido registrada exitosamente.', 'success');
      onCompraUpdated?.(); // Llamar al callback para refrescar la lista de compras
      onHide(); // Cerrar el modal
    } catch (error: any) {
      Swal.fire('Error', `Error al registrar la compra: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setIsSubmittingCompra(false);
    }
  };

  // Resetear el estado del modal cuando se cierra/abre
  useEffect(() => {
    if (!show) {
      setProveedorNombreSearch('');
      setProveedorDocumentoSearch('');
      setProveedoresSugeridos([]);
      setSelectedProveedor(null);
      setIsSearchingProveedores(false);
      setProveedorSearchError(null);
      // Resetear también estados de productos
      setProductoCodigoSearch('');
      setProductoNombreSearch('');
      setProductosSugeridos([]);
      setProductosAComprar([]);
      setIsSearchingProductos(false);
      setProductoSearchError(null);
      setTotalCompra(0); // Resetear total
      setIsSubmittingCompra(false);
      setSelectedMetodoPagoId(''); // Resetear método de pago seleccionado
      // No es necesario resetear metodosPago aquí, ya que se cargan al mostrar el modal
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Crear Nueva Compra</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!selectedProveedor ? (
          <>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="formProveedorDocumentoSearch">
                  <Form.Label>Buscar Proveedor por N° Documento</Form.Label>
                  <Form.Control
                    type="text"
                    name="proveedorDocumentoSearch"
                    placeholder="N° de documento"
                    value={proveedorDocumentoSearch}
                    onChange={handleSearchInputChange}
                    autoFocus
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formProveedorNombreSearch">
                  <Form.Label>o por Nombre (mín. 2 caracteres)</Form.Label>
                  <Form.Control
                    type="text"
                    name="proveedorNombreSearch"
                    placeholder="Nombre del proveedor"
                    value={proveedorNombreSearch}
                    onChange={handleSearchInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {isSearchingProveedores && <div className="text-center my-2"><Spinner animation="border" size="sm" /> Buscando clientes...</div>}
            {proveedorSearchError && <Alert variant="danger" className="my-2">{proveedorSearchError}</Alert>}
            {!isSearchingProveedores && proveedoresSugeridos.length > 0 && (
              <ListGroup className="mb-3 shadow-sm" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {proveedoresSugeridos.map((proveedor) => (
                  <ListGroup.Item
                    action
                    key={proveedor.idUsuario}
                    onClick={() => handleSelectProveedor(proveedor)}
                  >
                    <strong>{proveedor.nombre}</strong> ({proveedor.tipoDocumento}: {proveedor.numeroDocumento || 'N/A'})
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
            {!isSearchingProveedores &&
              (proveedorNombreSearch.length >= 2 || proveedorDocumentoSearch.length > 0) &&
              proveedoresSugeridos.length === 0 &&
              !proveedorSearchError && (
                <div className="text-muted my-2">No se encontraron proveedores que coincidan con los criterios de búsqueda.</div>
              )}
          </>
        ) : (
          <div className="mb-3 p-3 border rounded bg-light">
            <h5>Proveedor Seleccionado:</h5>
            <p className="mb-1">
              <strong>Nombre:</strong> {selectedProveedor.nombre}
            </p>
            <p className="mb-2">
              <strong>Documento:</strong> {selectedProveedor.tipoDocumento} - {selectedProveedor.numeroDocumento || 'N/A'}
            </p>
            <Button variant="outline-secondary" size="sm" onClick={handleClearSelectedProveedor}>
              Cambiar Proveedor
            </Button>
          </div>
        )}

        <hr />
        {/* Aquí irá el resto del formulario para agregar productos a la compra */}
        {selectedProveedor ? (
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
                    onClick={() => handleAddProductoACompra(prod)}
                    disabled={prod.stock <= 0}
                  >
                    <strong>{prod.nombre}</strong> (Código: {prod.codigo || 'N/A'}) - Precio Proveedor: ${prod.precioUnitarioProveedor.toFixed(2)} - Stock: {prod.stock}
                    {prod.stock <= 0 && <span className="text-danger ms-2">(Sin stock)</span>}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
            {!isSearchingProductos && (productoCodigoSearch || productoNombreSearch.length >= 2) && productosSugeridos.length === 0 && !productoSearchError && (
              <div className="text-muted my-2">No se encontraron productos que coincidan con los criterios de búsqueda.</div>
            )}

            {productosAComprar.length > 0 && (
              <>
                <h5 className="mt-4">Productos en esta Compra:</h5>
                <Table striped bordered hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unitario Proveedor</th>
                      <th>Subtotal</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosAComprar.map(item => (
                      <tr key={item.idProducto}>
                        <td>{item.nombre} ({item.codigo || 'N/A'})</td>
                        <td>
                          <Form.Control
                            type="number"
                            value={item.cantidadEnCompra}
                            onChange={(e) => handleCantidadProductoChange(item.idProducto, parseInt(e.target.value))}
                            min="1"
                            max={item.stock}
                            size="sm"
                            style={{ width: '80px' }}
                          />
                        </td>
                        <td>${item.precioUnitarioProveedor.toFixed(2)}</td>
                        <td>${(item.cantidadEnCompra * item.precioUnitarioProveedor).toFixed(2)}</td>
                        <td>
                          <Button variant="danger" size="sm" onClick={() => handleRemoveProductoDeCompra(item.idProducto)}>
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
          <p className="text-muted">Seleccione un proveedor para poder agregar productos a la compra.</p>
        )}

        {selectedProveedor && productosAComprar.length > 0 && (
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
          <h5>Total: ${totalCompra.toFixed(2)}</h5>
        </div>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleCrearCompra} disabled={!selectedProveedor || isSearchingProveedores || isSearchingProductos || productosAComprar.length === 0 || !selectedMetodoPagoId || isSubmittingCompra}>
          {isSubmittingCompra ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Creando...</> : 'Crear Compra'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CompraModal;