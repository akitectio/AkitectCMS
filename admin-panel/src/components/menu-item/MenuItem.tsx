import { CaretRightOutlined } from '@ant-design/icons';
import { IMenuItem } from '@app/modules/main/menu-sidebar/MenuSidebar';
import { Menu } from 'antd';
import type { MenuProps } from 'antd/es/menu';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

type MenuItem = Required<MenuProps>['items'][number];

const AntMenuItem = ({ menuItem }: { menuItem: IMenuItem }) => {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [forceUpdate, setForceUpdate] = useState(0);
  const [openedKeys, setOpenedKeys] = useState<string[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Force menu to update when location changes
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
    
    // Set active key based on current path
    if (menuItem.path && isPathMatch(menuItem.path)) {
      setActiveKey(menuItem.path);
    } else if (menuItem.children) {
      const matchingChild = menuItem.children.find(child => isPathMatch(child.path));
      if (matchingChild && matchingChild.path) {
        setActiveKey(matchingChild.path);
      }
    }
  }, [location.pathname]);

  // Create a menu item for Ant Design Menu
  const getMenuItem = useMemo((): MenuItem => {
    // If it has children, create a submenu
    if (menuItem.children && menuItem.children.length > 0) {
      // Convert each child to an Ant Design MenuItem
      const children = menuItem.children.map((child) => ({
        key: child.path || child.name,
        icon: <span className={child.icon}></span>,
        label: t(child.name),
        onClick: () => {
          navigate(child.path || '/');
          setActiveKey(child.path || child.name);
        },
      }));

      return {
        key: menuItem.path || menuItem.name,
        icon: <span className={menuItem.icon}></span>,
        label: t(menuItem.name),
        children: children,
      };
    }
    
    // If no children, create a regular menu item
    return {
      key: menuItem.path || menuItem.name,
      icon: <span className={menuItem.icon}></span>,
      label: t(menuItem.name),
      onClick: () => {
        navigate(menuItem.path || '/');
        setActiveKey(menuItem.path || menuItem.name);
      },
    };
  }, [menuItem, navigate, t]);

  // Improved path matching for better active state detection
  const isPathMatch = (menuPath: string | undefined): boolean => {
    if (!menuPath) return false;
    
    // Handle root path specifically
    if (menuPath === '/' && location.pathname === '/') {
      return true;
    }
    
    // For other pages, check if the current path starts with menu path
    // This allows sub-pages to highlight their parent menu
    if (menuPath !== '/') {
      // Make sure we match complete path segments
      if (menuPath.endsWith('/')) {
        return location.pathname.startsWith(menuPath);
      } else {
        // Ensure it's an exact match or followed by a '/'
        // This prevents '/users' from matching '/user' path
        return location.pathname === menuPath || 
               location.pathname.startsWith(menuPath + '/');
      }
    }
    
    return false;
  };

  // Get the selected keys based on the current path and active key
  const selectedKeys = useMemo(() => {
    // If we have an explicitly set active key, use it
    if (activeKey) {
      return [activeKey];
    }
    
    // If current path matches this menu item
    if (isPathMatch(menuItem.path)) {
      return [menuItem.path || menuItem.name];
    }
    
    // Check if any child path matches
    if (menuItem.children) {
      const matchingChild = menuItem.children.find(
        (child) => isPathMatch(child.path)
      );
      
      if (matchingChild) {
        return [matchingChild.path || matchingChild.name];
      }
    }
    
    return [];
  }, [location.pathname, menuItem, forceUpdate, activeKey]);

  // Get open keys for submenus
  useEffect(() => {
    if (menuItem.children) {
      const hasActiveChild = menuItem.children.some(
        (child) => isPathMatch(child.path)
      );
      
      if (hasActiveChild) {
        setOpenedKeys([menuItem.path || menuItem.name]);
      }
    }
  }, [location.pathname, menuItem, forceUpdate]);

  const onOpenChange = (keys: string[]) => {
    setOpenedKeys(keys);
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys}
      defaultOpenKeys={selectedKeys.length > 0 ? [menuItem.path || menuItem.name] : []}
      openKeys={openedKeys}
      onOpenChange={onOpenChange}
      items={[getMenuItem]}
      expandIcon={({ isOpen }) => <CaretRightOutlined rotate={isOpen ? 90 : 0} />}
      style={{ background: 'transparent', border: 'none' }}
    />
  );
};

export default AntMenuItem;
