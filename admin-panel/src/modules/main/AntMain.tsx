import {
    BellOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined,
    UserOutlined
} from '@ant-design/icons';
import { envConfig } from '@app/configs/loadEnv';
import themeConfig from '@app/configs/themeConfig';
import logout from '@app/store/reducers/auth';
import { toggleSidebarMenu } from '@app/store/reducers/ui';
import { useAppDispatch, useAppSelector } from '@app/store/store';
import { Avatar, Button, ConfigProvider, Dropdown, Layout, Menu, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { MENU } from './menu-sidebar/MenuSidebar';

const { Header, Sider, Content, Footer } = Layout;

const Logo = styled.div`
  height: 32px;
  margin: 16px;
  display: flex;
  align-items: center;
  color: white;
  font-size: 18px;
  font-weight: bold;

  img {
    height: 32px;
    margin-right: 8px;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AntMain: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['']);
  
  const menuSidebarCollapsed = useAppSelector((state) => state.ui.menuSidebarCollapsed);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [loading, setLoading] = useState(!currentUser);
  
  useEffect(() => {
    setCollapsed(menuSidebarCollapsed);
    setLoading(!currentUser);
  }, [menuSidebarCollapsed, currentUser]);

  // Update selected menu item based on current path
  useEffect(() => {
    const path = window.location.pathname;
    
    // Select the appropriate menu item based on the path
    if (path === '/' || path === '/dashboard') {
      setSelectedKeys(['dashboard']);
    } else if (path.startsWith('/users')) {
      setSelectedKeys(['users']);
    } else if (path.startsWith('/roles')) {
      setSelectedKeys(['roles']);
    } else if (path.startsWith('/permissions')) {
      setSelectedKeys(['permissions']);
    } else if (path.startsWith('/posts')) {
      setSelectedKeys(['posts']);
    } else if (path.startsWith('/categories')) {
      setSelectedKeys(['categories']);
    } else if (path.startsWith('/tags')) {
      setSelectedKeys(['tags']);
    }
  }, []);

  const handleMenuClick = (key: string) => {
    setSelectedKeys([key]);
    
    // Navigate based on the menu key
    switch(key) {
      case 'dashboard':
        navigate('/');
        break;
      case 'users':
        navigate('/users');
        break;
      case 'roles':
        navigate('/roles');
        break;
      case 'permissions':
        navigate('/permissions');
        break;
      case 'posts':
        navigate('/posts');
        break;
      case 'categories':
        navigate('/categories');
        break;
      case 'tags':
        navigate('/tags');
        break;
      default:
        break;
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
    dispatch(toggleSidebarMenu());
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  // Transform the MENU array into Ant Design menu items
  const menuItems = MENU.map(item => {
    // If item has children, create a submenu
    if (item.children && item.children.length > 0) {
      return {
        key: item.path?.replace('/', '') || item.name.toLowerCase(),
        icon: <span className={item.icon}></span>,
        label: item.name,
        children: item.children.map(child => ({
          key: child.path?.replace('/', '') || child.name.toLowerCase(),
          icon: <span className={child.icon}></span>,
          label: child.name,
          onClick: () => navigate(child.path || '/'),
        }))
      };
    }
    
    // Otherwise create a regular menu item
    return {
      key: item.path?.replace('/', '') || item.name.toLowerCase(),
      icon: <span className={item.icon}></span>,
      label: item.name,
      onClick: () => navigate(item.path || '/'),
    };
  });

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: handleProfile
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
      onClick: () => navigate('/profile')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout
    }
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="dark"
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000
          }}
        >
          <Logo>
            <img src="/img/logo.png" alt="Logo" />
            {!collapsed && envConfig.siteName}
          </Logo>
          
          <div style={{padding: '16px'}}>
            {!collapsed && currentUser && (
              <div style={{
                padding: '10px',
                color: 'white', 
                marginBottom: '10px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                <Avatar src={currentUser?.photoURL || "/img/default-profile.png"} style={{ marginRight: '8px' }} />
                <span>{currentUser?.email}</span>
              </div>
            )}
            {collapsed && currentUser && (
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <Avatar src={currentUser?.photoURL || "/img/default-profile.png"} />
              </div>
            )}
          </div>
          
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedKeys}
            items={menuItems}
            style={{ borderRight: 0 }}
          />
        </Sider>
        
        <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
          <Header style={{ 
            padding: '0 24px', 
            background: '#fff', 
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleCollapsed}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            
            <ProfileSection>
              {/* Notification button */}
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: '18px' }} />}
                onClick={() => {}}
              />
              
              {/* User Dropdown */}
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={currentUser?.photoURL || "/img/default-profile.png"}
                    size="small"
                    style={{ marginRight: '8px' }}
                  />
                  {currentUser?.email || "User"}
                </span>
              </Dropdown>
            </ProfileSection>
          </Header>
          
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
            <Outlet />
          </Content>
          
          <Footer style={{ textAlign: 'center' }}>
            &copy; {new Date().getFullYear()} {envConfig.siteName}
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AntMain;