import React from "react";
import { Container, Button, Table } from "react-bootstrap";

const CompraIndex = () => {
  return (
    <Container fluid className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestión de Compras</h2>
        <Button variant="primary">Crear Nueva Compra</Button>
      </div>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Listado de Compras</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <Table striped bordered hover width="100%">
              <thead>
                <tr>
                  <th>ID Compra</th>
                  <th>Proveedor</th>
                  <th>Fecha</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="text-center">
                    No hay compras registradas por el momento.
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CompraIndex;