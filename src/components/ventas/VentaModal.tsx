import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { Usuario } from '../../types/Usuario';
import usuarioService from '../../services/usuarioService';
import { debounce } from 'lodash'; // Necesitarás instalar lodash: npm install lodash @types/lodash

interface VentaModalProps {
  show: boolean;
  onHide: () => void;
  // Podrías añadir un callback para cuando la venta se cree, ej: onVentaCreada: () => void;
}

const VentaModal: React.FC<VentaModalProps> = ({ show, onHide }) => {
  const [clienteNombreSearch, setClienteNombreSearch] = useState('');
  const [clienteDocumentoSearch, setClienteDocumentoSearch] = useState('');
  const [clientesSugeridos, setClientesSugeridos] = useState<Usuario[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Usuario | null>(null);
  const [isSearchingClientes, setIsSearchingClientes] = useState(false);
  const [clienteSearchError, setClienteSearchError] = useState<string | null>(null);

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

  // Resetear el estado del modal cuando se cierra/abre
  useEffect(() => {
    if (!show) {
      setClienteNombreSearch('');
      setClienteDocumentoSearch('');
      setClientesSugeridos([]);
      setSelectedCliente(null);
      setIsSearchingClientes(false);
      setClienteSearchError(null);
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
            <Form.Group className="mb-3" controlId="formClienteDocumentoSearch">
              <Form.Label>Buscar por N° Documento</Form.Label>
              <Form.Control
                type="text"
                name="clienteDocumentoSearch"
                placeholder="Ingrese N° de documento"
                value={clienteDocumentoSearch}
                onChange={handleSearchInputChange}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formClienteNombreSearch">
              <Form.Label>Buscar por Nombre (mín. 2 caracteres)</Form.Label>
              <Form.Control
                type="text"
                name="clienteNombreSearch"
                placeholder="Ingrese nombre del cliente"
                value={clienteNombreSearch}
                onChange={handleSearchInputChange}
                // autoFocus lo dejamos en el primer campo
              />
            </Form.Group>
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
          <div>
            <h5>Productos de la Venta:</h5>
            <p>Próximamente: listado y adición de productos para <strong>{selectedCliente.nombre}</strong>.</p>
            {/* Aquí integrarías la lógica para añadir productos */}
          </div>
        ) : (
          <p className="text-muted">Seleccione un cliente para poder agregar productos a la venta.</p>
        )}

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={() => { /* Lógica para ir al siguiente paso o guardar */ }} disabled={!selectedCliente || isSearchingClientes}>
          {/* Podría ser "Siguiente" o "Guardar Venta" dependiendo de tu flujo */}
          Continuar con Productos
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VentaModal;