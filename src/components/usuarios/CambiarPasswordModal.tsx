import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import usuarioService from '../../services/usuarioService';

interface CambiarPasswordModalProps {
    show: boolean;
    onHide: () => void;
    idUsuario: string;
}

const CambiarPasswordModal: React.FC<CambiarPasswordModalProps> = ({ show, onHide, idUsuario }) => {
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleNewPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(event.target.value);
    };

    const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(event.target.value);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        if (newPassword !== confirmPassword) {
            setErrorMessage('Las contraseñas no coinciden.');
            setIsSubmitting(false);
            return;
        }

        try {
            await usuarioService.updateUsuarioPassword(idUsuario, newPassword);
            Swal.fire({
                icon: 'success',
                title: 'Contraseña Cambiada',
                text: 'La contraseña ha sido cambiada exitosamente.',
            });
            onHide();
        } catch (error: any) {
            let errorMessageText = 'Error al cambiar la contraseña.';
            if (error.response) {
                errorMessageText = `Error: ${error.response.data.message || 'Error al cambiar la contraseña'}`;
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
                <Modal.Title>Cambiar Contraseña</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formNewPassword">
                        <Form.Label>Nueva Contraseña</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Ingrese la nueva contraseña"
                            value={newPassword}
                            onChange={handleNewPasswordChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formConfirmPassword">
                        <Form.Label>Confirmar Contraseña</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Confirme la nueva contraseña"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            required
                        />
                    </Form.Group>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
                            Cerrar
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CambiarPasswordModal;
