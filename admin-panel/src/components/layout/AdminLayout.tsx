import '@/assets/css/admin.css';
import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Footer from './Footer.tsx';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="d-flex">
        <Sidebar collapsed={sidebarCollapsed} />
        
        <main className="content-wrapper flex-grow-1 py-3">
          <Container fluid>
            <Outlet />
          </Container>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminLayout;