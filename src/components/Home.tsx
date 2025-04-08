import React from 'react';

const Home: React.FC = () => {
    // Dummy data for Top Selling Products
    const topSellingProducts = [
        { id: 1, name: 'Producto A', sold: 150 },
        { id: 2, name: 'Producto B', sold: 120 },
        { id: 3, name: 'Producto C', sold: 100 },
        { id: 4, name: 'Producto D', sold: 90 },
        { id: 5, name: 'Producto E', sold: 80 },
    ];

    // Dummy data for Low Stock Products
    const lowStockProducts = [
        { id: 6, name: 'Producto F', stock: 5 },
        { id: 7, name: 'Producto G', stock: 3 },
        { id: 8, name: 'Producto H', stock: 2 },
        { id: 9, name: 'Producto I', stock: 10 },
        { id: 10, name: 'Producto J', stock: 7 },
    ];

    return (
        <div>
            <h1>Dashboard</h1>

            {/* Top Selling Products Table */}
            <div className="card shadow mb-4">
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
            </div>

            {/* Low Stock Products Table */}
            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-warning">Productos con Bajo Stock</h6>
                </div>
                <div className="card-body">
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
                                {lowStockProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td>{product.id}</td>
                                        <td>{product.name}</td>
                                        <td>{product.stock}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
