import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';

const AuthLayout: React.FC = () => {
    return (
        <Routes>
            <Route index element={<Login />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AuthLayout;
