import React from 'react';
import Sidebar from './Sidebar';

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
);

export default AppLayout;
