import { logout } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppDispatch';
import React from 'react';
import { Navbar as BootstrapNavbar, Dropdown } from 'react-bootstrap';
import { BsBell, BsList, BsPerson } from 'react-icons/bs';
import { Link } from 'react-router-dom';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return (
    <BootstrapNavbar bg="white" expand="lg" className="border-bottom shadow-sm">
      <div className="d-flex justify-content-between w-100 mx-3">
        <div className="d-flex align-items-center">
          <button className="btn" onClick={toggleSidebar}>
            <BsList size={24} />
          </button>
        </div>
        
        <div className="d-flex align-items-center">
          <Dropdown align="end" className="me-3">
            <Dropdown.Toggle variant="light" id="notification-dropdown" className="border-0 position-relative">
              <BsBell />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>Thông báo mới</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item>Xem tất cả thông báo</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" id="user-dropdown" className="border-0 d-flex align-items-center">
              <BsPerson className="me-2" />
              <span>{user?.fullName || 'Admin'}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/admin/profile">Hồ sơ</Dropdown.Item>
              <Dropdown.Item as={Link} to="/admin/settings">Cài đặt</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item as="button" onClick={handleLogout}>
                Đăng xuất
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </BootstrapNavbar>
  );
};

export default Navbar;