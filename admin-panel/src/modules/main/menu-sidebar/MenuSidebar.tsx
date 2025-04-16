import { UserOutlined } from '@ant-design/icons';
import { envConfig } from '@app/configs/loadEnv';
import { useAppSelector } from '@app/store/store';
import i18n from '@app/utils/i18n';
import { MenuItem } from '@components';
import { Image } from '@profabric/react-components';
import { Avatar, Layout, Typography } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const { Sider } = Layout;
const { Text } = Typography;

export interface IMenuItem {
  name: string;
  icon?: string;
  path?: string;
  children?: Array<IMenuItem>;
}

export const MENU: IMenuItem[] = [
  {
    name: i18n.t('menusidebar.label.dashboard'),
    icon: 'fas fa-tachometer-alt nav-icon',
    path: '/',
  },
  {
    name: 'Access Control',
    icon: 'fas fa-shield-alt nav-icon',
    children: [
      {
        name: 'Users',
        icon: 'fas fa-users nav-icon',
        path: '/users',
      },
      {
        name: 'Roles',
        icon: 'fas fa-shield-halved nav-icon',
        path: '/roles',
      },
      {
        name: 'Permissions',
        icon: 'fas fa-lock nav-icon',
        path: '/permissions',
      },
    ],
  },
  {
    name: 'Posts',
    icon: 'fas fa-newspaper nav-icon',
    path: '/posts',
  },
  {
    name: 'Categories',
    icon: 'fas fa-folder nav-icon',
    path: '/categories',
  },
  {
    name: 'Tags',
    icon: 'fas fa-tags nav-icon',
    path: '/tags',
  },
];

const MENU_WIDTH = 250;

const StyledSider = styled(Sider)<{ $sidebarSkin: string }>`
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: ${props => props.$sidebarSkin.includes('dark') ? '#343a40' : '#fff'};
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  z-index: 100;
`;

const LogoContainer = styled(Link)`
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  overflow: hidden;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const StyledBrandImage = styled(Image)`
  margin-right: 10px;
  opacity: 0.8;
  --pf-box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23) !important;
  
  &:hover {
    opacity: 1;
  }
`;

const BrandText = styled.span<{ $isDark: boolean }>`
  color: ${props => props.$isDark ? '#fff' : 'rgba(0, 0, 0, 0.85)'};
  white-space: nowrap;
  font-weight: 300;
  font-size: 1.25rem;
`;

const UserPanel = styled.div<{ $isDark: boolean }>`
  padding: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(${props => props.$isDark ? '255, 255, 255, 0.1' : '0, 0, 0, 0.1'});
`;

const UserInfo = styled.div`
  margin-left: 10px;
  overflow: hidden;
`;

const UserLink = styled(Link)<{ $isDark: boolean }>`
  color: ${props => props.$isDark ? '#fff' : 'rgba(0, 0, 0, 0.85)'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  
  &:hover {
    color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.65)'};
  }
`;

const MenuContainer = styled.div<{ $isDark: boolean; $menuChildIndent: boolean }>`
  .ant-menu {
    border-right: none;
    background: transparent;
    
    .ant-menu-item {
      margin: 0;
      padding-left: ${props => props.$menuChildIndent ? '40px' : '24px'} !important;
      color: ${props => props.$isDark ? '#fff' : 'rgba(0, 0, 0, 0.85)'};
    }
    
    .ant-menu-submenu-title {
      margin: 0;
      padding-left: ${props => props.$menuChildIndent ? '40px' : '24px'} !important;
      color: ${props => props.$isDark ? '#fff' : 'rgba(0, 0, 0, 0.85)'};
    }
    
    .ant-menu-item-selected {
      background-color: ${props => props.$isDark ? '#3f6791' : '#e6f7ff'};
    }
  }
`;

const MenuSidebar = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const sidebarSkin = useAppSelector((state) => state.ui.sidebarSkin);
  const menuItemFlat = useAppSelector((state) => state.ui.menuItemFlat);
  const menuChildIndent = useAppSelector((state) => state.ui.menuChildIndent);
  
  const isDark = sidebarSkin.includes('dark');

  return (
    <StyledSider 
      width={MENU_WIDTH} 
      $sidebarSkin={sidebarSkin}
      theme={isDark ? 'dark' : 'light'}
    >
      <LogoContainer to="/">
        <StyledBrandImage
          src="/img/logo.png"
          alt="Logo"
          width={33}
          height={33}
          rounded
        />
        <BrandText $isDark={isDark}>{envConfig.siteName}</BrandText>
      </LogoContainer>
      
      <UserPanel $isDark={isDark}>
        <Avatar 
          src={currentUser?.photoURL || '/img/default-profile.png'} 
          size={34} 
          icon={<UserOutlined />} 
        />
        <UserInfo>
          <UserLink to="/profile" $isDark={isDark}>
            {currentUser?.email}
          </UserLink>
        </UserInfo>
      </UserPanel>
      
      <MenuContainer $isDark={isDark} $menuChildIndent={menuChildIndent}>
        <div style={{ overflowY: 'auto', height: 'calc(100vh - 120px)' }}>
          {MENU.map((menuItem: IMenuItem) => (
            <MenuItem
              key={menuItem.name + menuItem.path}
              menuItem={menuItem}
            />
          ))}
        </div>
      </MenuContainer>
    </StyledSider>
  );
};

export default MenuSidebar;
