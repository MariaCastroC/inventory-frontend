import React, { useState, useEffect } from 'react';
import './usuarios.css';
import { Usuario } from '../../types/Usuario';
import UsuarioModal from './UsuarioModal';
import CambiarPasswordModal from './CambiarPasswordModal';
import Swal from 'sweetalert2';
import usuarioService from '../../services/usuarioService';

const UsuarioIndex: React.FC = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState<Usuario>();
    const [showCambiarPasswordModal, setShowCambiarPasswordModal] = useState(false);
    const [selectedUsuarioId, setSelectedUsuarioId] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchUsuarios = async () => {
        setIsLoading(true);
        try {
            const pageSize = 2;
            const data = await usuarioService.getUsuarios(currentPage, pageSize, searchQuery);
            setUsuarios(data.content);
            setTotalPages(data.totalPages);
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al obtener los usuarios. '+ e,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, [currentPage, searchQuery]);

    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = (usuario?: Usuario) => {
        setSelectedUsuario(usuario);
        setShowModal(true);
    };

    const handleCloseCambiarPasswordModal = () => setShowCambiarPasswordModal(false);
    const handleShowCambiarPasswordModal = (idUsuario: string) => {
        setSelectedUsuarioId(idUsuario);
        setShowCambiarPasswordModal(true);
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

    const handleDeleteUsuario = async (idUsuario: string) => {
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
                    await usuarioService.deleteUsuario(idUsuario);
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: 'El usuario ha sido eliminado.',
                    });
                    fetchUsuarios();
                } catch (e) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al eliminar el usuario. ' + e,
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
                <h2>Gestión de Usuarios</h2>
                <button className="btn btn-primary" onClick={() => handleShowModal(undefined)}>Agregar Usuario</button>
            </div>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar usuarios por nombre..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Lista de Usuarios</h6>
                </div>
                <div className="card-body">
                    {isLoading ? (
                        <div className="text-center">Cargando...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped" id="dataTable" width="100%" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Dirección</th>
                                        <th>Teléfono</th>
                                        <th>Tipo Documento</th>
                                        <th>Nro. Documento</th>
                                        <th>Rol</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.map((usuario) => (
                                        <tr key={usuario.idUsuario}>
                                            <td>{usuario.nombre}</td>
                                            <td>{usuario.email}</td>
                                            <td>{usuario.direccion}</td>
                                            <td>{usuario.telefono}</td>
                                            <td>{usuario.tipoDocumento || 'N/A'}</td>
                                            <td>{usuario.numeroDocumento || 'N/A'}</td>
                                            <td>{usuario.rol.nombre}</td>
                                            <td>
                                                <button className="btn btn-sm btn-primary me-1" onClick={() => handleShowModal(usuario)}>Editar</button>
                                                <button className="btn btn-sm btn-warning me-1" onClick={() => handleShowCambiarPasswordModal(usuario.idUsuario || '')}>Cambiar Contraseña</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteUsuario(usuario.idUsuario || '')}>Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {/* Paginador */}
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
                </div>
            </div>

            <UsuarioModal show={showModal} onHide={handleCloseModal} usuario={selectedUsuario} onUsuarioUpdated={fetchUsuarios} />
            <CambiarPasswordModal show={showCambiarPasswordModal} onHide={handleCloseCambiarPasswordModal} idUsuario={selectedUsuarioId} />
        </div>
    );
};

export default UsuarioIndex;
