import React, { useState, useEffect, useCallback } from 'react';
import { Producto } from '../../types/Producto';
import { Categoria } from '../../types/Categoria';
import { Usuario } from '../../types/Usuario';
import ProductoModal from './ProductoModal';
import Swal from 'sweetalert2';
import productoService from '../../services/productoService';
import categoriaService from '../../services/categoriaService';
import usuarioService from '../../services/usuarioService';
import { Button, Form, Row, Col, Table, Pagination } from 'react-bootstrap';
import './producto.css';

const ProductoIndex: React.FC = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProducto, setSelectedProducto] = useState<Producto | undefined>();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchCategoriaId, setSearchCategoriaId] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pageSize] = useState<number>(10); // Default page size

    const [allCategorias, setAllCategorias] = useState<Categoria[]>([]);
    const [allProveedores, setAllProveedores] = useState<Usuario[]>([]);

    const fetchProductos = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await productoService.getProductos(currentPage, pageSize, searchQuery, searchCategoriaId || undefined);
            setProductos(data.content);
            setTotalPages(data.totalPages);
        } catch (e: any) {
            Swal.fire('Error', `Error al obtener los productos: ${e.response?.data?.message || e.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, searchQuery, searchCategoriaId]);

    const fetchAuxData = async () => {
        try {
            const [categoriasData, proveedoresData] = await Promise.all([
                categoriaService.getAllCategorias(),
                usuarioService.getProveedores()
            ]);
            setAllCategorias(categoriasData);
            setAllProveedores(proveedoresData);
        } catch (e: any) {
            Swal.fire('Error', `Error al obtener datos auxiliares: ${e.response?.data?.message || e.message}`, 'error');
        }
    };

    useEffect(() => {
        fetchAuxData();
    }, []);

    useEffect(() => {
        fetchProductos();
    }, [fetchProductos]);

    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = (producto?: Producto) => {
        setSelectedProducto(producto);
        setShowModal(true);
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        setCurrentPage(1);
    };

    const handleCategoriaFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSearchCategoriaId(event.target.value);
        setCurrentPage(1);
    };

    const handleDeleteProducto = async (idProducto: string) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'No podrás revertir esto.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then(async (result) => {
            if (result.isConfirmed) {
                setIsLoading(true);
                try {
                    await productoService.deleteProducto(idProducto);
                    Swal.fire('Eliminado', 'El producto ha sido eliminado.', 'success');
                    if (productos.length === 1 && currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                    } else {
                        fetchProductos();
                    }
                } catch (e: any) {
                    Swal.fire('Error', `Error al eliminar el producto: ${e.response?.data?.message || e.message}`, 'error');
                } finally {
                    setIsLoading(false);
                }
            }
        });
    };

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Gestión de Productos</h2>
                <Button variant="primary" onClick={() => handleShowModal(undefined)}>Agregar Producto</Button>
            </div>

            <Row className="mb-3">
                <Col md={8}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar productos por nombre..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </Col>
                <Col md={4}>
                    <Form.Select value={searchCategoriaId} onChange={handleCategoriaFilterChange}>
                        <option value="">Todas las categorías</option>
                        {allCategorias.map(cat => (
                            <option key={cat.idCategoria} value={cat.idCategoria}>{cat.nombre}</option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Lista de Productos</h6>
                </div>
                <div className="card-body">
                    {isLoading && <div className="text-center">Cargando...</div>}
                    {!isLoading && (
                        <div className="table-responsive">
                            <Table striped bordered hover id="dataTableProductos" width="100%">
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Nombre</th>
                                        <th>Descripción</th>
                                        <th>Precio</th>
                                        <th>Stock</th>
                                        <th>Categoría</th>
                                        <th>Proveedor</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.map((producto) => (
                                        <tr key={producto.idProducto}>
                                            <td>{producto.codigo || 'N/A'}</td>
                                            <td>{producto.nombre}</td>
                                            <td>{producto.descripcion || 'N/A'}</td>
                                            <td>{producto.precioUnitario.toFixed(2)}</td>
                                            <td>{producto.stock}</td>
                                            <td>{producto.categoria.nombre}</td>
                                            <td>{producto.proveedor.nombre}</td>
                                            <td>
                                                <Button variant="primary" size="sm" className="me-1" onClick={() => handleShowModal(producto)}>Editar</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDeleteProducto(producto.idProducto || '')}>Eliminar</Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {productos.length === 0 && !isLoading && (
                                        <tr><td colSpan={8} className="text-center">No se encontraron productos.</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}
                    {totalPages > 1 && !isLoading && (
                        <div className="d-flex justify-content-center mt-3">
                            <Pagination>
                                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                                {[...Array(totalPages).keys()].map(num => (
                                    <Pagination.Item key={num + 1} active={num + 1 === currentPage} onClick={() => handlePageChange(num + 1)}>
                                        {num + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                            </Pagination>
                        </div>
                    )}
                </div>
            </div>

            <ProductoModal show={showModal} onHide={handleCloseModal} producto={selectedProducto} onProductoUpdated={fetchProductos} categorias={allCategorias} proveedores={allProveedores} />
        </div>
    );
};

export default ProductoIndex;