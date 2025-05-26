import React, { useState } from 'react';
import { Button, Table, Container } from 'react-bootstrap';
import VentaModal from './VentaModal'; // Asegúrate que la ruta sea correcta si es diferente

const VentaIndex: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  return (
    <Container fluid className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestión de Ventas</h2>
        <Button variant="primary" onClick={handleShowModal}>
          Crear Nueva Venta
        </Button>
      </div>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Listado de Ventas</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <Table striped bordered hover id="dataTableVentas" width="100%">
              <thead>
                <tr>
                  <th>ID Venta</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  {/* <th>Acciones</th> */}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="text-center">
                    No hay ventas registradas por el momento.
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>
      </div>

      <VentaModal show={showModal} onHide={handleCloseModal} />
    </Container>
  );
};

export default VentaIndex;