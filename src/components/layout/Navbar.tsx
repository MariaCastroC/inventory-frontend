import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    sub: string;
}

interface NavbarProps {
    toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
    const { setToken } = useAuth();
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken: DecodedToken = jwtDecode(token);
                setUsername(decodedToken.sub);
            } catch (error) {
                console.error('Error decoding token:', error);
                setUsername(null);
            }
        }
    }, []);

    const handleLogout = () => {
        setToken(null);
    };

    return (
        <nav className="navbar navbar-expand navbar-light topbar mb-4 static-top shadow">
            {/* Sidebar Toggle (Topbar) */}
            <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3" onClick={toggleSidebar}>
                <i className="fa fa-bars"></i>
            </button>

            {/* Logo (Left Side) */}
            <a className="navbar-brand" href="/home"> {/* Add a link to your home page */}
                InvApp
            </a>

            {/* Topbar Navbar */}
            <ul className="navbar-nav ml-auto">
                {/* Nav Item - User Information */}
                <li className="nav-item dropdown no-arrow">
                    <a className="nav-link dropdown-toggle user-info" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i className="fas fa-user fa-lg user-icon"></i> {/* User icon */}
                        <span className="mr-2 d-none d-lg-inline text-gray-600 small">{username || 'Usuario'}</span> {/* Replace with user name */}
                    </a>
                    {/* Dropdown - User Information */}
                    <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#logoutModal" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                            Cerrar Sesion
                        </a>
                    </div>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
