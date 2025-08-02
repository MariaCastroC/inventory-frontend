import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { Producto } from '../../types/Producto';
import { Categoria } from '../../types/Categoria';
import { Usuario } from '../../types/Usuario'; // Assuming Usuario is used for Proveedor
import productoService from '../../services/productoService';
import Swal from 'sweetalert2';

interface ProductoModalProps {
  show: boolean;
  onHide: () => void;
  producto?: Producto;
  onProductoUpdated: () => void;
  categorias: Categoria[];
  proveedores: Usuario[]; // List of available suppliers
}

const ProductoModal: React.FC<ProductoModalProps> = ({ show, onHide, producto, onProductoUpdated, categorias, proveedores }) => {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState<number | ''>(''); // Cambiado para manejar número o string vacío
  const [descripcion, setDescripcion] = useState('');
  const [precioUnitarioVenta, setPrecioUnitarioVenta] = useState<number | ''>('');
  const [precioUnitarioProveedor, setPrecioUnitarioProveedor] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [selectedCategoriaId, setSelectedCategoriaId] = useState('');
  const [selectedProveedorId, setSelectedProveedorId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ codigo?: string; nombre?: string; precioUnitarioVenta?: string; precioUnitarioProveedor?: string; stock?: string; categoria?: string; proveedor?: string }>({});

  useEffect(() => {
    if (producto) {
      setCodigo(producto.codigo !== undefined ? producto.codigo : ''); // producto.codigo es number
      setNombre(producto.nombre);
      setDescripcion(producto.descripcion || '');
      setPrecioUnitarioVenta(producto.precioUnitarioVenta);
      setPrecioUnitarioProveedor(producto.precioUnitarioProveedor);
      setStock(producto.stock);
      setSelectedCategoriaId(producto.categoria.idCategoria || '');
      setSelectedProveedorId(producto.proveedor.idUsuario || ''); // Assuming idUsuario is the ID for Usuario
    } else {
      // Reset form for new producto
      setCodigo('');
      setNombre('');
      setDescripcion('');
      setPrecioUnitarioVenta('');
      setPrecioUnitarioProveedor('');
      setStock('');
      setSelectedCategoriaId('');
      setSelectedProveedorId('');
    }
    setErrors({}); // Clear errors when modal opens or producto changes
  }, [producto, show]);

  const validateForm = () => {
    const newErrors: { codigo?: string; nombre?: string; precioUnitarioVenta?: string; precioUnitarioProveedor?: string; stock?: string; categoria?: string; proveedor?: string } = {};
    if (codigo === '' || codigo === null || (typeof codigo === 'number' && codigo <= 0)) newErrors.codigo = 'El código es obligatorio y debe ser un número positivo.';
    if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
    if (precioUnitarioVenta === '' || precioUnitarioVenta === null || precioUnitarioVenta <= 0) newErrors.precioUnitarioVenta = 'El precio de venta debe ser un número positivo.';
    if (precioUnitarioProveedor === '' || precioUnitarioProveedor === null || precioUnitarioProveedor <= 0) newErrors.precioUnitarioProveedor = 'El precio del proveedor debe ser un número positivo.';
    if (stock === '' || stock === null || stock < 0) newErrors.stock = 'El stock debe ser un número no negativo.';
    if (!selectedCategoriaId) newErrors.categoria = 'Debe seleccionar una categoría.';
    if (!selectedProveedorId) newErrors.proveedor = 'Debe seleccionar un proveedor.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const productoData = {
      idProducto: producto?.idProducto,
      codigo: Number(codigo),
      nombre,
      descripcion,
      precioUnitarioVenta: Number(precioUnitarioVenta),
      precioUnitarioProveedor: Number(precioUnitarioProveedor),
      stock: Number(stock),
      categoria: { idCategoria: selectedCategoriaId },
      proveedor: { idUsuario: selectedProveedorId },
    };

    try {
      if (producto && producto.idProducto) {
        await productoService.updateProducto(producto.idProducto, productoData);
        Swal.fire('¡Actualizado!', 'El producto ha sido actualizado.', 'success');
      } else {
        await productoService.createProducto(productoData);
        Swal.fire('¡Creado!', 'El producto ha sido creado.', 'success');
      }
      onProductoUpdated();
      onHide();
    } catch (error: any) {
      Swal.fire('Error', `Error al guardar el producto: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{producto ? 'Editar Producto' : 'Agregar Producto'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formProductoCodigo">
            <Form.Label>Código</Form.Label>
            <Form.Control type="number" placeholder="Código del producto" value={codigo} onChange={(e) => setCodigo(e.target.value === '' ? '' : Number(e.target.value))} isInvalid={!!errors.codigo} />
            <Form.Control.Feedback type="invalid">{errors.codigo}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formProductoNombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control type="text" placeholder="Nombre del producto" value={nombre} onChange={(e) => setNombre(e.target.value)} isInvalid={!!errors.nombre} />
            <Form.Control.Feedback type="invalid">{errors.nombre}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formProductoDescripcion">
            <Form.Label>Descripción (Opcional)</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Descripción del producto" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </Form.Group>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="formProductoPrecioVenta">
                <Form.Label>Precio Unitario Venta</Form.Label>
                <Form.Control type="number" placeholder="Precio" value={precioUnitarioVenta} onChange={(e) => setPrecioUnitarioVenta(e.target.value === '' ? '' : Number(e.target.value))} isInvalid={!!errors.precioUnitarioVenta} />
                <Form.Control.Feedback type="invalid">{errors.precioUnitarioVenta}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="formProductoPrecioProveedor">
                <Form.Label>Precio Unitario Proveedor</Form.Label>
                <Form.Control type="number" placeholder="Precio" value={precioUnitarioProveedor} onChange={(e) => setPrecioUnitarioProveedor(e.target.value === '' ? '' : Number(e.target.value))} isInvalid={!!errors.precioUnitarioProveedor} />
                <Form.Control.Feedback type="invalid">{errors.precioUnitarioProveedor}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="formProductoStock">
                <Form.Label>Stock</Form.Label>
                <Form.Control type="number" placeholder="Stock disponible" value={stock} onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))} isInvalid={!!errors.stock} />
                <Form.Control.Feedback type="invalid">{errors.stock}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3" controlId="formProductoCategoria">
            <Form.Label>Categoría</Form.Label>
            <Form.Select value={selectedCategoriaId} onChange={(e) => setSelectedCategoriaId(e.target.value)} isInvalid={!!errors.categoria}>
              <option value="">Seleccione una categoría</option>
              {categorias.map(cat => <option key={cat.idCategoria} value={cat.idCategoria}>{cat.nombre}</option>)}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.categoria}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formProductoProveedor">
            <Form.Label>Proveedor</Form.Label>
            <Form.Select value={selectedProveedorId} onChange={(e) => setSelectedProveedorId(e.target.value)} isInvalid={!!errors.proveedor}>
              <option value="">Seleccione un proveedor</option>
              {(Array.isArray(proveedores) ? proveedores : []).map(prov => <option key={prov.idUsuario} value={prov.idUsuario}>{prov.nombre}</option>)}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.proveedor}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductoModal;