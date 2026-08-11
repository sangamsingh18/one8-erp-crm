import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/common/ErrorBoundary';
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
import Inventory from './pages/Inventory';
import StockMovements from './pages/StockMovements';
import LowStock from './pages/LowStock';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Employees from './pages/Employees';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import './index.css';

const App = () => (
  <AuthProvider>
    <NotificationProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Landing />} />

        <Route path="/dashboard" element={
          <ProtectedRoute permissionKey="dashboard"><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
        } />

        {/* Customers */}
        <Route path="/customers" element={
          <ProtectedRoute permissionKey="customers"><AppLayout><Customers /></AppLayout></ProtectedRoute>
        } />
        <Route path="/customers/new" element={
          <ProtectedRoute permissionKey="customers"><AppLayout><CustomerForm /></AppLayout></ProtectedRoute>
        } />
        <Route path="/customers/:id" element={
          <ProtectedRoute permissionKey="customers"><AppLayout><CustomerDetail /></AppLayout></ProtectedRoute>
        } />
        <Route path="/customers/:id/edit" element={
          <ProtectedRoute permissionKey="customers"><AppLayout><CustomerForm /></AppLayout></ProtectedRoute>
        } />

        {/* Products */}
        <Route path="/products" element={
          <ProtectedRoute permissionKey="products"><AppLayout><Products /></AppLayout></ProtectedRoute>
        } />
        <Route path="/products/new" element={
          <ProtectedRoute permissionKey="products"><AppLayout><ProductForm /></AppLayout></ProtectedRoute>
        } />
        <Route path="/products/:id" element={
          <ProtectedRoute permissionKey="products"><AppLayout><ProductDetail /></AppLayout></ProtectedRoute>
        } />
        <Route path="/products/:id/edit" element={
          <ProtectedRoute permissionKey="products"><AppLayout><ProductForm /></AppLayout></ProtectedRoute>
        } />

        {/* Challans */}
        <Route path="/challans" element={
          <ProtectedRoute permissionKey="challans"><AppLayout><Challans /></AppLayout></ProtectedRoute>
        } />
        <Route path="/challans/new" element={
          <ProtectedRoute permissionKey="challans"><AppLayout><ChallanForm /></AppLayout></ProtectedRoute>
        } />
        <Route path="/challans/:id" element={
          <ProtectedRoute permissionKey="challans"><AppLayout><ChallanDetail /></AppLayout></ProtectedRoute>
        } />
        <Route path="/challans/:id/edit" element={
          <ProtectedRoute permissionKey="challans"><AppLayout><ChallanForm /></AppLayout></ProtectedRoute>
        } />

        {/* Inventory */}
        <Route path="/inventory" element={
          <ProtectedRoute permissionKey="inventory"><AppLayout><Inventory /></AppLayout></ProtectedRoute>
        } />

        {/* Stock Movements */}
        <Route path="/stock-movements" element={
          <ProtectedRoute permissionKey="stock-movements"><AppLayout><StockMovements /></AppLayout></ProtectedRoute>
        } />

        {/* Low Stock */}
        <Route path="/low-stock" element={
          <ProtectedRoute permissionKey="low-stock"><AppLayout><LowStock /></AppLayout></ProtectedRoute>
        } />

        {/* Invoices */}
        <Route path="/invoices" element={
          <ProtectedRoute permissionKey="invoices"><AppLayout><Invoices /></AppLayout></ProtectedRoute>
        } />

        {/* Payments */}
        <Route path="/payments" element={
          <ProtectedRoute permissionKey="payments"><AppLayout><Payments /></AppLayout></ProtectedRoute>
        } />

        {/* Reports */}
        <Route path="/reports" element={
          <ProtectedRoute permissionKey="reports"><AppLayout><Reports /></AppLayout></ProtectedRoute>
        } />

        {/* Employees */}
        <Route path="/employees" element={
          <ProtectedRoute permissionKey="employees"><AppLayout><Employees /></AppLayout></ProtectedRoute>
        } />

        {/* Settings */}
        <Route path="/settings" element={
          <ProtectedRoute permissionKey="settings"><AppLayout><Settings /></AppLayout></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
    </NotificationProvider>
  </AuthProvider>
</ErrorBoundary>
);

export default App;
