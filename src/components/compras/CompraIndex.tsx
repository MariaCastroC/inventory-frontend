import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Container, Row, Col, Form, Pagination, Spinner, Badge } from 'react-bootstrap';
import Swal from 'sweetalert2';
import CompraModal from './CompraModal';
import compraService from '../../services/compraService';
import { CompraResponseDTO, DetalleCompraDto } from '../../types/Compra';

const CompraIndex: React.FC = () => {
  const [compras, setCompras] = useState<CompraResponseDTO[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchNombreProveedor, setSearchNombreProveedor] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pageSize] = useState<number>(2);

  const fetchCompras = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await compraService.getCompras(currentPage, pageSize, searchNombreProveedor || undefined);
      setCompras(data.content);
      setTotalPages(data.totalPages);
    } catch (e: any) {
      Swal.fire('Error', `Error al obtener las compras: ${e.response?.data?.message || e.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchNombreProveedor]);

  useEffect(() => {
    fetchCompras();
  }, [fetchCompras]);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  };

  const handleShowDetalleModal = async (compraId: string) => {
    Swal.fire({
      title: 'Cargando detalles...',
      text: 'Por favor, espere.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const detalles: DetalleCompraDto[] = await compraService.getDetalleCompra(compraId);

      if (detalles.length > 0) {
        const detallesHtml = `
          <div class="table-responsive">
            <table class="table table-bordered text-start" style="margin-top: 20px;">
              <thead class="thead-light">
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario Proveedor</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${detalles
            .map(
              (detalle) => `
                      <tr>
                        <td>${detalle.producto.nombre}</td>
                        <td class="text-center">${detalle.cantidad}</td>
                        <td class="text-end">${formatCurrency(detalle.precioUnitarioProveedor)}</td>
                        <td class="text-end">${formatCurrency(detalle.cantidad * detalle.precioUnitarioProveedor)}</td>
                      </tr>
                    `
            )
            .join('')}
              </tbody>
            </table>
          </div>
        `;

        Swal.fire({
          title: '<strong>Detalles de la Compra</strong>',
          html: detallesHtml,
          icon: 'info',
          width: '800px',
          confirmButtonText: 'Cerrar',
        });
      } else {
        Swal.fire('Sin Detalles', 'No se encontraron productos para esta compra.', 'info');
      }
    } catch (e: any) {
      Swal.fire('Error', `Error al obtener los detalles: ${e.response?.data?.message || e.message}`, 'error');
    }
  };

  const handleAnularCompra = async (idCompra: string) => {
    const { value: observacion } = await Swal.fire({
      title: '¿Anular esta compra?',
      text: "Esta acción no se puede revertir. Por favor, ingrese el motivo de la anulación.",
      icon: 'warning',
      input: 'textarea',
      inputPlaceholder: 'Escriba aquí la observación...',
      inputAttributes: {
        'aria-label': 'Escriba aquí la observación'
      },
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return '¡Necesita escribir una observación para anular la compra!';
        }
      }
    });

    if (observacion) {
      try {
        setIsLoading(true);
        await compraService.anularCompra(idCompra, observacion);
        Swal.fire(
          '¡Anulada!',
          'La compra ha sido anulada correctamente.',
          'success'
        );
        fetchCompras(); // Actualizar la tabla para reflejar el cambio de estado
      } catch (error: any) {
        Swal.fire(
          'Error',
          `No se pudo anular la compra: ${error.response?.data?.message || error.message}`,
          'error'
        );
        setIsLoading(false); // Detener el loading si hay error
      }
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchNombreProveedor(event.target.value);
    setCurrentPage(1);
  };

  const handleGeneratePurchaseInvoice = async (id: string, nombreCliente: string) => {
    Swal.fire({
      title: 'Generando factura...',
      text: 'Por favor, espere.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const resp = await compraService.generarFacturaCompra(id, nombreCliente);

      if (resp) {
        Swal.fire('Factura Compra', 'La factura de compra ha sido generada exitosamente!', 'success');
      } else {
        Swal.fire('Sin Detalles', 'No se pudo generar la factura para esta compra.', 'info');
      }
    } catch (e: any) {
      Swal.fire('Error', `Error al generar la factura: ${e.response?.data?.message || e.message}`, 'error');
    }


  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={8} className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Cargando compras...</p>
          </td>
        </tr>
      );
    }

    if (compras.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="text-center">No se encontraron compras.</td>
        </tr>
      );
    }

    return compras.map((compra) => (
      <tr key={compra.idCompra}>
        <td>{compra.idCompra.split('-').pop()}</td>
        <td>{compra.nombreCliente}</td>
        <td>{compra.nombreProveedor}</td>
        <td>{formatDate(compra.fechaCompra)}</td>
        <td>{formatCurrency(compra.total)}</td>
        <td>{compra.metodoPago}</td>
        <td>
          <Badge bg={compra.estado === 'ANULADA' ? 'danger' : 'success'}>
            {compra.estado}
          </Badge>
        </td>
        <td>
          <Button variant="info" size="sm" className="me-2" onClick={() => handleShowDetalleModal(compra.idCompra)}>
            Productos
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleAnularCompra(compra.idCompra)}
            disabled={compra.estado === 'ANULADA'}
            className='me-2'
          >
            Anular
          </Button>
          <Button
            variant="warning"
            size="sm"
            onClick={() => handleGeneratePurchaseInvoice(compra.idCompra, compra.nombreProveedor)}
          >
            Generar Factura
          </Button>
        </td>
      </tr>
    ));
  };

  return (
    <Container fluid className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Gestión de Compras</h2>
        <Button variant="primary" onClick={handleShowModal}>
          Crear Nueva Compra
        </Button>
      </div>

      <Row className="mb-3">
        <Col>
          <Form.Control
            type="text"
            placeholder="Buscar por nombre de proveedor..."
            value={searchNombreProveedor}
            onChange={handleSearchChange}
          />
        </Col>
      </Row>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Listado de Compras</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <Table striped bordered hover id="dataTableCompras" width="100%">
              <thead>
                <tr>
                  <th>ID Compra</th>
                  <th>Cliente</th>
                  <th>Proveedor</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Método Pago</th>
                  <th>Estado</th>
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

      <CompraModal show={showModal} onHide={handleCloseModal} onCompraUpdated={fetchCompras} />
    </Container>
  );
};

export default CompraIndex;
