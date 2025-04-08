import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Logout from './components/auth/Logout';
import Home from './components/Home';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/admin-template.css';
import Usuarios from './components/usuarios/Usuarios';
import { axiosInstance } from './utils/axiosInterceptor';
import AuthLayout from './components/auth/AuthLayout';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import Spinner from 'react-bootstrap/Spinner';

function useAxiosResponseInterceptor() {
    const navigate = useNavigate();
    const { setToken, setIsLoading } = useAuth();

    useEffect(() => {
        const responseInterceptor = axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    console.log("Token inválido o expirado. Redirigiendo al login.");
                    setToken(null);
                    setIsLoading(false);
                    navigate('/login');
                } else if (error.response) {
                    console.error('Error en la petición:', error.response.status, error.response.data);
                } else {
                    console.error('Error en la petición:', error.message);
                }
                return Promise.reject(error);
            }
        );
        return () => {
            axiosInstance.interceptors.response.eject(responseInterceptor);
        };
    }, [navigate, setToken, setIsLoading]);
}

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
};

const AppRoutes: React.FC = () => {
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login/*" element={!isLoggedIn ? <AuthLayout /> : <Navigate to="/home" />} />
            {/* Protected Routes */}
            <Route path="/*" element={isLoggedIn ? <AppContent /> : <Navigate to="/login" />} />
        </Routes>
    );
};

const AppContent: React.FC = () => {
    const location = useLocation();
    const { isLoggedIn } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    useAxiosResponseInterceptor();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <>
            {isLoggedIn && location.pathname !== '/login' && <Navbar toggleSidebar={toggleSidebar} />}
            <div className='main-container'>
                {isLoggedIn && location.pathname !== '/login' && <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
                <div className='content-container'>
                    <Routes>
                        <Route path="/logout" element={<Logout />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/usuarios" element={<Usuarios />} />
                    </Routes>
                </div>
            </div>
        </>
    );
};

export default App;
