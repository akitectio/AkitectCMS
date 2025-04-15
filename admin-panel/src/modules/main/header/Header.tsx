import { AppstoreOutlined, MenuOutlined } from '@ant-design/icons';
import LanguagesDropdown from '@app/modules/main/header/languages-dropdown/LanguagesDropdown';
import MessagesDropdown from '@app/modules/main/header/messages-dropdown/MessagesDropdown';
import NotificationsDropdown from '@app/modules/main/header/notifications-dropdown/NotificationsDropdown';
import UserDropdown from '@app/modules/main/header/user-dropdown/UserDropdown';
import {
    toggleControlSidebar,
    toggleSidebarMenu,
} from '@app/store/reducers/ui';
import { useAppDispatch, useAppSelector } from '@app/store/store';
import { Image } from '@profabric/react-components';
import { Button, Col, Layout, Row, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { styled } from 'styled-components';

const { Header: AntHeader } = Layout;

const StyledHeader = styled(AntHeader)<{ $variant: string; $headerBorder: boolean }>`
  background: ${props => props.$variant === 'navbar-white' ? '#fff' : props.$variant === 'navbar-dark' ? '#343a40' : '#3c8dbc'};
  color: ${props => props.$variant === 'navbar-white' ? 'rgba(0, 0, 0, 0.85)' : '#fff'};
  padding: 0 16px;
  line-height: 56px;
  height: 56px;
  border-bottom: ${props => props.$headerBorder ? 'none' : '1px solid #dee2e6'};
  display: flex;
  align-items: center;
  position: fixed;
  z-index: 1000;
  right: 0;
  left: 0;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.125), 0 1px 3px rgba(0, 0, 0, 0.2);
`;

const StyledBrandImage = styled(Image)`
  opacity: 0.8;
  --pf-box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23) !important;
  margin: 0 8px 0 0;

  &:hover {
    opacity: 1;
  }
`;

const BrandText = styled.span<{ $isDark: boolean }>`
  color: ${props => props.$isDark ? '#fff' : 'rgba(0, 0, 0, 0.85)'};
  font-weight: 300;
  font-size: 1.25rem;
`;

const StyledLink = styled(Link)<{ $isDark: boolean }>`
  color: ${props => props.$isDark ? '#fff' : 'rgba(0, 0, 0, 0.85)'};
  transition: all 0.3s;
  padding: 0 15px;
  
  &:hover {
    color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.65)'};
  }
`;

const StyledButton = styled(Button)<{ $isDark: boolean }>`
  color: ${props => props.$isDark ? '#fff' : 'rgba(0, 0, 0, 0.85)'};
  border: none;
  background: transparent;
  box-shadow: none;
  padding: 0 15px;
  height: 56px;
  
  &:hover {
    color: ${props => props.$isDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.65)'};
    background: transparent;
  }
`;

const Header = ({ containered, ...rest }: { containered?: boolean } & any) => {
  const [t] = useTranslation();
  const dispatch = useAppDispatch();
  const navbarVariant = useAppSelector((state) => state.ui.navbarVariant);
  const headerBorder = useAppSelector((state) => state.ui.headerBorder);
  const topNavigation = useAppSelector((state) => state.ui.topNavigation);
  
  // Check if the navbar is dark
  const isDark = navbarVariant !== 'navbar-white';

  const handleToggleMenuSidebar = () => {
    dispatch(toggleSidebarMenu());
  };

  const handleToggleControlSidebar = () => {
    dispatch(toggleControlSidebar());
  };

  return (
    <StyledHeader 
      $variant={navbarVariant} 
      $headerBorder={headerBorder}
      {...rest}
    >
      <Row 
        justify="space-between" 
        align="middle" 
        style={{ width: '100%' }}
        className={containered ? 'container' : ''}
      >
        <Col>
          <Space>
            {!topNavigation && (
              <StyledButton 
                type="text" 
                icon={<MenuOutlined />} 
                onClick={handleToggleMenuSidebar}
                $isDark={isDark}
              />
            )}
            
            {topNavigation && (
              <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                <StyledBrandImage
                  src="/img/logo.png"
                  alt="AdminLTE Logo"
                  width={33}
                  height={33}
                  rounded
                />
                <BrandText $isDark={isDark}>AdminLTE 3</BrandText>
              </Link>
            )}
            
            <StyledLink to="/" $isDark={isDark}>
              {t('header.label.home')}
            </StyledLink>
            
            <StyledLink to="/profile" $isDark={isDark}>
              Profile
            </StyledLink>
          </Space>
        </Col>
        
        <Col>
          <Space size="middle">
            <MessagesDropdown />
            <NotificationsDropdown />
            <LanguagesDropdown />
            <UserDropdown />
            <StyledButton 
              type="text" 
              icon={<AppstoreOutlined />} 
              onClick={handleToggleControlSidebar}
              $isDark={isDark}
            />
          </Space>
        </Col>
      </Row>
    </StyledHeader>
  );
};

export default Header;
