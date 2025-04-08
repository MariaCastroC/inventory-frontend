import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useUserRole from '../../hooks/useUserRole';
import { ROLES, RoleType } from '../../constants/roles';

interface SidebarProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, toggleSidebar }) => {
    const { userRole, isLoadingRole } = useUserRole();
    const location = useLocation();
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sidebar = sidebarRef.current;
        if (sidebar) {
            if (isSidebarOpen) {
                sidebar.classList.add('show');
            } else {
                sidebar.classList.remove('show');
            }
        }
    }, [isSidebarOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isSidebarOpen) {
                toggleSidebar();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen, toggleSidebar]);

    if (isLoadingRole) {
        return <div>Cargando...</div>;
    }

    const getMenuItems = (role: RoleType | null) => {
        switch (role) {
            case ROLES.ADMIN:
                return [
                    { path: '/home', label: 'Inicio', icon: 'fas fa-fw fa-tachometer-alt' },
                    { path: '/usuarios', label: 'Usuarios', icon: 'fas fa-fw fa-users' },
                    { path: '/productos', label: 'Productos', icon: 'fas fa-fw fa-box' },
                    { path: '/ventas', label: 'Ventas', icon: 'fas fa-fw fa-shopping-cart' },
                    { path: '/compras', label: 'Compras', icon: 'fas fa-fw fa-truck' },
                ];
            case ROLES.VENTAS:
                return [
                    { path: '/home', label: 'Inicio', icon: 'fas fa-fw fa-tachometer-alt' },
                    { path: '/ventas', label: 'Ventas', icon: 'fas fa-fw fa-shopping-cart' },
                    { path: '/productos', label: 'Productos', icon: 'fas fa-fw fa-box' },
                ];
            case ROLES.COMPRAS:
                return [
                    { path: '/home', label: 'Inicio', icon: 'fas fa-fw fa-tachometer-alt' },
                    { path: '/compras', label: 'Compras', icon: 'fas fa-fw fa-truck' },
                    { path: '/productos', label: 'Productos', icon: 'fas fa-fw fa-box' },
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems(userRole);
    const logoutItem = { path: '/logout', label: 'Cerrar Sesión', icon: 'fas fa-fw fa-sign-out-alt' };

    return (
        <aside className="sidebar" ref={sidebarRef}>
            <nav className='sidebar-nav'>
                <ul>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.path} className={isActive ? 'active' : ''}>
                                <Link to={item.path}>
                                    <i className={`${item.icon} mr-2`}></i> {/* Add icon */}
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                <ul className='logout-container'>
                    <li key={logoutItem.path} className='logout-item'>
                        <Link to={logoutItem.path}>
                            <i className={`${logoutItem.icon} mr-2`}></i> {/* Add icon */}
                            {logoutItem.label}
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
