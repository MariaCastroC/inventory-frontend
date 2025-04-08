import React, { useState, useEffect, ChangeEvent } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Rol } from '../../types/Rol';
import { Usuario } from '../../types/Usuario';
import Swal from 'sweetalert2';
import rolService from '../../services/rolService';
import usuarioService from '../../services/usuarioService';

interface UsuarioModalProps {
    show: boolean;
    onHide: () => void;
    usuario?: Usuario;
    onUsuarioUpdated: () => void;
}

const UsuarioModal: React.FC<UsuarioModalProps> = ({ show, onHide, usuario: usuarioProp, onUsuarioUpdated }) => {
    const [roles, setRoles] = useState<Rol[]>([]);
    const [selectedRolId, setSelectedRolId] = useState<string>('');
    const [usuario, setUsuario] = useState<Usuario>({
        idUsuario: '',
        nombre: '',
        email: '',
        direccion: '',
        telefono: '',
        password: '',
        rol: { idRol: '', nombre: '', descripcion: '' }
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isNewUser, setIsNewUser] = useState<boolean>(false);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const data = await rolService.getRoles();
                setRoles(data);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al cargar los roles.',
                });
            }
        };
        fetchRoles();
    }, []);

    useEffect(() => {
        if (usuarioProp) {
            setUsuario({ ...usuarioProp });
            setSelectedRolId(usuarioProp.rol.idRol.toString());
            setIsNewUser(false);
        } else {
            setUsuario({
                idUsuario: '',
                nombre: '',
                email: '',
                direccion: '',
                telefono: '',
                password: '',
                rol: { idRol: '', nombre: '', descripcion: '' }
            });
            setSelectedRolId('');
            setIsNewUser(true);
        }
        setErrorMessage(null);
    }, [usuarioProp]);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setUsuario({
            ...usuario,
            [name]: value,
        });
    };

    const handleRolChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedRolId(e.target.value);
        setUsuario((prevUsuario) => ({
            ...prevUsuario,
            rol: { ...prevUsuario.rol, idRol: e.target.value }
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const usuarioToSend = {
                ...usuario,
                rol: { idRol: selectedRolId }
            };

            let isEdit = false;
            if (usuario.idUsuario) {
                // Edición
                await usuarioService.updateUsuario(usuario.idUsuario, usuarioToSend);
                isEdit = true;
            } else {
                // Creación
                await usuarioService.createUsuario(usuarioToSend);
            }

            Swal.fire({
                icon: 'success',
                title: isEdit ? 'Usuario Editado' : 'Usuario Creado',
                text: isEdit ? 'El usuario ha sido editado exitosamente.' : 'El usuario ha sido creado exitosamente.',
            });
            onHide();
            onUsuarioUpdated();
        } catch (error: any) {
            let errorMessageText = 'Error al guardar el usuario.';
            if (error.response) {
                errorMessageText = `Error: ${error.response.data.message || 'Error al guardar el usuario'}`;
            } else {
                errorMessageText = 'Error de conexión con el servidor.';
            }
            setErrorMessage(errorMessageText);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessageText,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{usuarioProp ? 'Editar Usuario' : 'Agregar Usuario'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formNombre">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            name="nombre"
                            placeholder="Ingrese el nombre"
                            value={usuario.nombre}
                            onChange={handleInputChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="formEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            placeholder="Ingrese el email"
                            value={usuario.email}
                            onChange={handleInputChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="formDireccion">
                        <Form.Label>Dirección</Form.Label>
                        <Form.Control
                            type="text"
                            name="direccion"
                            placeholder="Ingrese la dirección"
                            value={usuario.direccion}
                            onChange={handleInputChange}
                        />
                    </Form.Group>

                    <Form.Group controlId="formTelefono">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                            type="text"
                            name="telefono"
                            placeholder="Ingrese el teléfono"
                            value={usuario.telefono}
                            onChange={handleInputChange}
                        />
                    </Form.Group>
                    {/* Campo de contraseña solo para nuevos usuarios */}
                    {isNewUser && (
                        <Form.Group controlId="formPassword">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                placeholder="Ingrese la contraseña"
                                value={usuario.password}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                    )}

                    <Form.Group controlId="formRol">
                        <Form.Label>Rol</Form.Label>
                        <Form.Control as="select" value={selectedRolId} onChange={handleRolChange} required>
                            <option value="">Seleccionar Rol</option>
                            {roles.map((rol: Rol) => (
                                <option key={rol.idRol} value={rol.idRol}>
                                    {rol.nombre}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
                            Cerrar
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default UsuarioModal;
