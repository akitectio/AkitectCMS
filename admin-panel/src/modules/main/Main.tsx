import { Loading } from '@app/components/Loading';
import ControlSidebar from '@app/modules/main/control-sidebar/ControlSidebar';
import Footer from '@app/modules/main/footer/Footer';
import Header from '@app/modules/main/header/Header';
import { toggleSidebarMenu } from '@app/store/reducers/ui';
import { useAppDispatch, useAppSelector } from '@app/store/store';
import {
    addWindowClass,
    removeWindowClass,
    scrollbarVisible,
} from '@app/utils/helpers';
import { Layout } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { styled } from 'styled-components';
import MenuSidebar from './menu-sidebar/MenuSidebar';

const { Content } = Layout;

const MENU_WIDTH = 250;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const MainContent = styled(Content)<{ $sidebarWidth: string }>`
  margin-left: ${(props) => props.$sidebarWidth};
  margin-top: 56px;
  padding: 24px;
  background-color: #f4f6f9;
  transition: margin-left 0.3s ease-in-out;
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const MainContainer = styled.div<{ $boxed: boolean }>`
  ${(props) => props.$boxed ? 'max-width: 1250px; margin: 0 auto;' : ''}
`;

const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
  
  &.visible {
    display: block;
  }
`;

const Main = () => {
  const dispatch = useAppDispatch();
  const menuSidebarCollapsed = useAppSelector(
    (state) => state.ui.menuSidebarCollapsed
  );
  const controlSidebarCollapsed = useAppSelector(
    (state) => state.ui.controlSidebarCollapsed
  );
  const layoutBoxed = useAppSelector((state) => state.ui.layoutBoxed);
  const topNavigation = useAppSelector((state) => state.ui.topNavigation);

  const screenSize = useAppSelector((state) => state.ui.screenSize);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [isScrollbarVisible, setIsScrollbarVisible] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleToggleMenuSidebar = () => {
    dispatch(toggleSidebarMenu());
  };

  useEffect(() => {
    setIsAppLoaded(Boolean(currentUser));
  }, [currentUser]);

  useEffect(() => {
    removeWindowClass('register-page');
    removeWindowClass('login-page');
    removeWindowClass('hold-transition');

    addWindowClass('sidebar-mini');

    return () => {
      removeWindowClass('sidebar-mini');
    };
  }, []);

  useEffect(() => {
    removeWindowClass('sidebar-closed');
    removeWindowClass('sidebar-collapse');
    removeWindowClass('sidebar-open');
    if (menuSidebarCollapsed && screenSize === 'lg') {
      addWindowClass('sidebar-collapse');
    } else if (menuSidebarCollapsed && screenSize === 'xs') {
      addWindowClass('sidebar-open');
    } else if (!menuSidebarCollapsed && screenSize !== 'lg') {
      addWindowClass('sidebar-closed');
      addWindowClass('sidebar-collapse');
    }
  }, [screenSize, menuSidebarCollapsed]);

  useEffect(() => {
    if (controlSidebarCollapsed) {
      removeWindowClass('control-sidebar-slide-open');
    } else {
      addWindowClass('control-sidebar-slide-open');
    }
  }, [screenSize, controlSidebarCollapsed]);

  const handleUIChanges = () => {
    setIsScrollbarVisible(scrollbarVisible(window.document.body));
  };

  useEffect(() => {
    window.document.addEventListener('scroll', handleUIChanges);
    window.document.addEventListener('resize', handleUIChanges);

    return () => {
      window.document.removeEventListener('scroll', handleUIChanges);
      window.document.removeEventListener('resize', handleUIChanges);
    };
  }, []);

  useEffect(() => {
    handleUIChanges();
  }, [mainRef.current]);

  // Calculate sidebar width based on screen size and navigation mode
  const getSidebarWidth = () => {
    if (topNavigation) {
      return '0px';
    }
    if (['sm', 'xs'].includes(screenSize)) {
      return '0px';
    }
    return `${MENU_WIDTH}px`;
  };

  const getAppTemplate = useCallback(() => {
    if (!isAppLoaded) {
      return <Loading />;
    }
    
    const sidebarWidth = getSidebarWidth();
    
    return (
      <StyledLayout>
        <Header
          containered={layoutBoxed}
          style={{
            marginLeft: sidebarWidth,
          }}
        />

        {!topNavigation && <MenuSidebar />}

        <MainContent 
          ref={mainRef}
          $sidebarWidth={sidebarWidth}
        >
          <MainContainer $boxed={layoutBoxed}>
            <Outlet />
          </MainContainer>
        </MainContent>

        <Footer
          containered={layoutBoxed}
          style={{
            marginLeft: sidebarWidth,
          }}
        />
        
        <ControlSidebar />
        
        <SidebarOverlay
          className={screenSize === 'sm' && menuSidebarCollapsed ? 'visible' : ''}
          onClick={handleToggleMenuSidebar}
        />
      </StyledLayout>
    );
  }, [
    isAppLoaded,
    menuSidebarCollapsed,
    screenSize,
    layoutBoxed,
    topNavigation,
  ]);

  return getAppTemplate();
};

export default Main;
