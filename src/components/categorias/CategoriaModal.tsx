import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Categoria } from '../../types/Categoria';
import categoriaService from '../../services/categoriaService';
import Swal from 'sweetalert2';

interface CategoriaModalProps {
  show: boolean;
  onHide: () => void;
  categoria?: Categoria; // Categoria existente para editar, undefined para crear
  onCategoriaUpdated: () => void; // Callback para refrescar la lista de categorías
}

const CategoriaModal: React.FC<CategoriaModalProps> = ({ show, onHide, categoria, onCategoriaUpdated }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ nombre?: string }>({});

  useEffect(() => {
    if (categoria) {
      setNombre(categoria.nombre);
      setDescripcion(categoria.descripcion || '');
    } else {
      // Reset form for new categoria
      setNombre('');
      setDescripcion('');
    }
    setErrors({}); // Clear errors when modal opens or categoria changes
  }, [categoria, show]);

  const validateForm = () => {
    const newErrors: { nombre?: string } = {};
    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const categoriaData: Categoria = {
      idCategoria: categoria?.idCategoria,
      nombre,
      descripcion,
    };

    try {
      if (categoria && categoria.idCategoria) {
        await categoriaService.updateCategoria(categoria.idCategoria, categoriaData);
        Swal.fire('¡Actualizado!', 'La categoría ha sido actualizada.', 'success');
      } else {
        await categoriaService.createCategoria(categoriaData);
        Swal.fire('¡Creado!', 'La categoría ha sido creada.', 'success');
      }
      onCategoriaUpdated(); // Refrescar lista
      onHide(); // Cerrar modal
    } catch (error: any) {
      Swal.fire('Error', `Error al guardar la categoría: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{categoria ? 'Editar Categoría' : 'Agregar Categoría'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formCategoriaNombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control type="text" placeholder="Nombre de la categoría" value={nombre} onChange={(e) => setNombre(e.target.value)} isInvalid={!!errors.nombre} />
            <Form.Control.Feedback type="invalid">{errors.nombre}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formCategoriaDescripcion">
            <Form.Label>Descripción (Opcional)</Form.Label>
            <Form.Control as="textarea" rows={3} placeholder="Descripción de la categoría" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
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

export default CategoriaModal;