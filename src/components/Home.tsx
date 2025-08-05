import React, { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Producto } from '../types/Producto';
import productoService from '../services/productoService';

const Home: React.FC = () => {

    const [productos, setProductos] = useState<Producto[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchProductos = useCallback(async () => {

        setIsLoading(true);

        try {
            const data = await productoService.getProductosLowestStock();
            setProductos(data);
        } catch (e: any) {
            Swal.fire('Error', `Error al obtener los productos: ${e.response?.data?.message || e.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProductos();
    }, [fetchProductos]);


    // Dummy data for Top Selling Products
    // const topSellingProducts = [
    //     { id: 1, name: 'Producto A', sold: 150 },
    //     { id: 2, name: 'Producto B', sold: 120 },
    //     { id: 3, name: 'Producto C', sold: 100 },
    //     { id: 4, name: 'Producto D', sold: 90 },
    //     { id: 5, name: 'Producto E', sold: 80 },
    // ];

    // Dummy data for Low Stock Products
    // const lowStockProducts = [
    //     { id: 6, name: 'Producto F', stock: 5 },
    //     { id: 7, name: 'Producto G', stock: 3 },
    //     { id: 8, name: 'Producto H', stock: 2 },
    //     { id: 9, name: 'Producto I', stock: 10 },
    //     { id: 10, name: 'Producto J', stock: 7 },
    // ];

    return (
        <div>
            <h1>Dashboard</h1>

            {/* Top Selling Products Table */}
            {/* <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Productos Más Vendidos</h6>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Vendidos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topSellingProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td>{product.id}</td>
                                        <td>{product.name}</td>
                                        <td>{product.sold}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div> */}

            {/* Low Stock Products Table */}
            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-warning">Productos con Bajo Stock</h6>
                </div>
                <div className="card-body">
                    {isLoading && <div className="text-center">Cargando...</div>}
                    {!isLoading && (
                        <div className="table-responsive">
                            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.length > 0
                                        ? productos.map((product) => (
                                            <tr key={product.idProducto}>
                                                <td>{product.idProducto}</td>
                                                <td>{product.nombre}</td>
                                                <td>{(product.stock)}</td>
                                            </tr>
                                        )) :
                                        productos.length === 0 && !isLoading && (
                                            <tr><td colSpan={3} className="text-center">No se encontraron productos.</td></tr>
                                        )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
