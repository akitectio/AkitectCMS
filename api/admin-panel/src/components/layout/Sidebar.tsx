import React from 'react';
import { Nav } from 'react-bootstrap';
import {
    BsBook,
    BsCollection,
    BsFileEarmarkText,
    BsGear,
    BsPeople,
    BsSpeedometer2
} from 'react-icons/bs';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  return (
    <div className={`sidebar bg-dark text-white ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand p-3">
        <h4 className="text-center">AkitectCMS</h4>
      </div>
      
      <Nav className="flex-column">
        <Nav.Item>
          <NavLink to="/admin" end className="nav-link py-3 px-4 d-flex align-items-center">
            <BsSpeedometer2 className="me-3" />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
        </Nav.Item>
        
        <Nav.Item>
          <NavLink to="/admin/posts" className="nav-link py-3 px-4 d-flex align-items-center">
            <BsFileEarmarkText className="me-3" />
            {!collapsed && <span>Bài viết</span>}
          </NavLink>
        </Nav.Item>
        
        <Nav.Item>
          <NavLink to="/admin/categories" className="nav-link py-3 px-4 d-flex align-items-center">
            <BsCollection className="me-3" />
            {!collapsed && <span>Danh mục</span>}
          </NavLink>
        </Nav.Item>
        
        <Nav.Item>
          <NavLink to="/admin/series" className="nav-link py-3 px-4 d-flex align-items-center">
            <BsBook className="me-3" />
            {!collapsed && <span>Khóa học</span>}
          </NavLink>
        </Nav.Item>
        
        <Nav.Item>
          <NavLink to="/admin/users" className="nav-link py-3 px-4 d-flex align-items-center">
            <BsPeople className="me-3" />
            {!collapsed && <span>Người dùng</span>}
          </NavLink>
        </Nav.Item>
        
        <Nav.Item>
          <NavLink to="/admin/settings" className="nav-link py-3 px-4 d-flex align-items-center">
            <BsGear className="me-3" />
            {!collapsed && <span>Cài đặt</span>}
          </NavLink>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default Sidebar;