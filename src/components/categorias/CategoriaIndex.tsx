import React, { useState, useEffect } from 'react';
import { Categoria } from '../../types/Categoria';
import CategoriaModal from './CategoriaModal';
import Swal from 'sweetalert2';
import categoriaService from '../../services/categoriaService';
import './categoria.css';

const CategoriaIndex: React.FC = () => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedCategoria, setSelectedCategoria] = useState<Categoria | undefined>();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pageSize] = useState<number>(2);

    const fetchCategorias = async () => {
        setIsLoading(true);
        try {
            const data = await categoriaService.getCategorias(currentPage, pageSize, searchQuery);
            setCategorias(data.content);
            setTotalPages(data.totalPages);
        } catch (e: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error al obtener las categorías: ${e.response?.data?.message || e.message}`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategorias();
    }, [currentPage, searchQuery, pageSize]); // pageSize añadido por si cambia

    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = (categoria?: Categoria) => {
        setSelectedCategoria(categoria);
        setShowModal(true);
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        setCurrentPage(1); // Reset page to 1 on new search
    };

    const handleDeleteCategoria = async (idCategoria: string) => {
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
                    await categoriaService.deleteCategoria(idCategoria);
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminada',
                        text: 'La categoría ha sido eliminada.',
                    });
                    // Si la página actual queda vacía después de eliminar, ir a la anterior si es posible
                    if (categorias.length === 1 && currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                    } else {
                        fetchCategorias(); // O simplemente recargar la página actual
                    }
                } catch (e: any) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: `Error al eliminar la categoría: ${e.response?.data?.message || e.message}`,
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        });
    };

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Gestión de Categorías</h2>
                <button className="btn btn-primary" onClick={() => handleShowModal(undefined)}>Agregar Categoría</button>
            </div>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar categorías por nombre..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Lista de Categorías</h6>
                </div>
                <div className="card-body">
                    {isLoading ? (
                        <div className="text-center">Cargando...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped" id="dataTableCategorias" width="100%" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Descripción</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categorias.map((categoria) => (
                                        <tr key={categoria.idCategoria}>
                                            <td>{categoria.nombre}</td>
                                            <td>{categoria.descripcion || 'N/A'}</td>
                                            <td>
                                                <button className="btn btn-sm btn-primary me-1" onClick={() => handleShowModal(categoria)}>Editar</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteCategoria(categoria.idCategoria || '')}>Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {categorias.length === 0 && !isLoading && (
                                        <tr><td colSpan={3} className="text-center">No se encontraron categorías.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {/* Paginador */}
                    {totalPages > 1 && !isLoading && (
                        <div className="d-flex justify-content-center mt-3">
                            <nav>
                                <ul className="pagination">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Anterior</button>
                                    </li>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChange(page)}>{page}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Siguiente</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            <CategoriaModal show={showModal} onHide={handleCloseModal} categoria={selectedCategoria} onCategoriaUpdated={fetchCategorias} />
        </div>
    );
};

export default CategoriaIndex;