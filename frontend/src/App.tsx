import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import CustomerForm from './pages/CustomerForm';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ProductForm from './pages/ProductForm';
import Challans from './pages/Challans';
import ChallanDetail from './pages/ChallanDetail';
import ChallanForm from './pages/ChallanForm';
import './index.css';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
        } />

        <Route path="/customers" element={
          <ProtectedRoute roles={['admin', 'sales', 'accounts']}><AppLayout><Customers /></AppLayout></ProtectedRoute>
        } />
        <Route path="/customers/new" element={
          <ProtectedRoute roles={['admin', 'sales']}><AppLayout><CustomerForm /></AppLayout></ProtectedRoute>
        } />
        <Route path="/customers/:id" element={
          <ProtectedRoute roles={['admin', 'sales', 'accounts']}><AppLayout><CustomerDetail /></AppLayout></ProtectedRoute>
        } />
        <Route path="/customers/:id/edit" element={
          <ProtectedRoute roles={['admin', 'sales']}><AppLayout><CustomerForm /></AppLayout></ProtectedRoute>
        } />

        <Route path="/products" element={
          <ProtectedRoute><AppLayout><Products /></AppLayout></ProtectedRoute>
        } />
        <Route path="/products/new" element={
          <ProtectedRoute roles={['admin', 'warehouse']}><AppLayout><ProductForm /></AppLayout></ProtectedRoute>
        } />
        <Route path="/products/:id" element={
          <ProtectedRoute><AppLayout><ProductDetail /></AppLayout></ProtectedRoute>
        } />
        <Route path="/products/:id/edit" element={
          <ProtectedRoute roles={['admin', 'warehouse']}><AppLayout><ProductForm /></AppLayout></ProtectedRoute>
        } />

        <Route path="/challans" element={
          <ProtectedRoute><AppLayout><Challans /></AppLayout></ProtectedRoute>
        } />
        <Route path="/challans/new" element={
          <ProtectedRoute roles={['admin', 'sales']}><AppLayout><ChallanForm /></AppLayout></ProtectedRoute>
        } />
        <Route path="/challans/:id" element={
          <ProtectedRoute><AppLayout><ChallanDetail /></AppLayout></ProtectedRoute>
        } />
        <Route path="/challans/:id/edit" element={
          <ProtectedRoute roles={['admin', 'sales']}><AppLayout><ChallanForm /></AppLayout></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
