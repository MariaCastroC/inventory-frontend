import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Container, Row, Col, Form, Pagination, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { VentaResponseDTO } from '../../types/Venta'; // Cambiado a VentaResponseDTO
import ventaService from '../../services/ventaService';
import VentaModal from './VentaModal';
// import DetalleVentaModal from './DetalleVentaModal'; // Modal para ver el listado de productos

const VentaIndex: React.FC = () => {
  const [ventas, setVentas] = useState<VentaResponseDTO[]>([]); // Usamos la nueva interfaz
  const [showModal, setShowModal] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<VentaResponseDTO | undefined>(); // Usamos la nueva interfaz
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchNombreCliente, setSearchNombreCliente] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pageSize] = useState<number>(2);

  const fetchVentas = useCallback(async () => {
    setIsLoading(true);
    try {
      // El servicio ya devuelve la data con la estructura del DTO
      const data = await ventaService.getVentas(currentPage, pageSize, searchNombreCliente || undefined);
      setVentas(data.content);
      setTotalPages(data.totalPages);
    } catch (e: any) {
      Swal.fire('Error', `Error al obtener las ventas: ${e.response?.data?.message || e.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchNombreCliente]);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVenta(undefined);
  };

  const handleShowModal = () => {
    setSelectedVenta(undefined); // Solo para crear, no se edita
    setShowModal(true);
  };

  const handleShowDetalleModal = (venta: VentaResponseDTO) => { // Usamos la nueva interfaz
    setSelectedVenta(venta);
    // Aquí se mostraría el modal con el listado de productos de la venta
    alert(`Mostrando detalles para la venta...`);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchNombreCliente(event.target.value);
    setCurrentPage(1); // Reinicia a la primera página en una nueva búsqueda
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={6} className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Cargando ventas...</p>
          </td>
        </tr>
      );
    }

    if (ventas.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="text-center">No se encontraron ventas.</td>
        </tr>
      );
    }

    return ventas.map((venta) => (
      <tr key={venta.idVenta}>
        {/* Accedemos a las propiedades aplanadas del DTO */}
        <td>{venta.nombreCliente}</td>
        <td>{venta.nombreVendedor}</td>
        <td>{formatDate(venta.fechaVenta)}</td>
        <td>{formatCurrency(venta.total)}</td>
        <td>{venta.metodoPago}</td>
        <td>
          <Button variant="info" size="sm" onClick={() => handleShowDetalleModal(venta)}>
            Productos
          </Button>
        </td>
      </tr>
    ));
  };

  return (
    <Container fluid className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestión de Ventas</h2>
        <Button variant="primary" onClick={handleShowModal}>
          Crear Nueva Venta
        </Button>
      </div>

      <Row className="mb-3">
        <Col>
          <Form.Control
            type="text"
            placeholder="Buscar por nombre de cliente..."
            value={searchNombreCliente}
            onChange={handleSearchChange}
          />
        </Col>
      </Row>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Listado de Ventas</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <Table striped bordered hover id="dataTableVentas" width="100%">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Vendedor</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Método Pago</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>{renderTableBody()}</tbody>
            </Table>
          </div>
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

      <VentaModal show={showModal} onHide={handleCloseModal} onVentaUpdated={fetchVentas} />
      
      {/* {selectedVenta && (
        <DetalleVentaModal show={showDetalleModal} onHide={() => setShowDetalleModal(false)} venta={selectedVenta} />
      )} */}
    </Container>
  );
};

export default VentaIndex;
