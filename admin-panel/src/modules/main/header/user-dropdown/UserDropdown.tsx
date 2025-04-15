import { LogoutOutlined, ProfileOutlined, UserOutlined } from '@ant-design/icons';
import { } from '@app/index';
import { logoutUser } from '@app/services/auth';
import { useAppSelector } from '@app/store/store';
import type { MenuProps } from 'antd';
import { Avatar, Button, Col, Dropdown, Row, Typography } from 'antd';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const { Text, Title } = Typography;

const UserHeader = styled.div`
  background-color: #3c8dbc;
  color: #fff;
  padding: 16px;
  text-align: center;
  border-radius: 3px 3px 0 0;
`;

const UserInfo = styled.div`
  margin-top: 10px;
  
  p {
    margin-bottom: 0;
  }
`;

const UserBody = styled.div`
  padding: 10px;
  border-bottom: 1px solid #f4f4f4;
`;

const UserLink = styled(Link)`
  display: block;
  text-align: center;
  padding: 5px 0;
  color: #444;
  
  &:hover {
    background-color: #f8f9fa;
    color: #000;
  }
`;

const UserFooter = styled.div`
  padding: 10px;
  display: flex;
  justify-content: space-between;
`;

const StyledAvatar = styled(Avatar)`
  cursor: pointer;
`;

const DropdownContent = styled.div`
  background: #fff;
  border-radius: 3px;
  width: 280px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const UserDropdown = () => {
  const navigate = useNavigate();
  const [t] = useTranslation();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const logOut = async (event: any) => {
    event.preventDefault();
    setDropdownOpen(false);
    // Call the logout function from auth service
    logoutUser();
  };

  const navigateToProfile = (event: any) => {
    event.preventDefault();
    setDropdownOpen(false);
    navigate('/profile');
  };

  const items: MenuProps['items'] = [
    {
      key: 'dropdown',
      label: null,
      children: [],
    },
  ];

  const dropdownContent = (
    <DropdownContent>
      <UserHeader>
        <Avatar 
          src={currentUser?.photoURL || '/img/default-profile.png'} 
          size={90} 
          icon={<UserOutlined />} 
        />
        <UserInfo>
          <Text style={{ color: '#fff', fontSize: '16px' }}>
            {currentUser?.email}
          </Text>
          <br />
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
            <span>Member since </span>
            {currentUser?.metadata?.creationTime && (
              <span>
                {DateTime.fromRFC2822(
                  currentUser?.metadata?.creationTime
                ).toFormat('dd LLL yyyy')}
              </span>
            )}
          </Text>
        </UserInfo>
      </UserHeader>
      
      <UserBody>
        <Row gutter={0}>
          <Col span={8}>
            <UserLink to="/">{t('header.user.followers')}</UserLink>
          </Col>
          <Col span={8}>
            <UserLink to="/">{t('header.user.sales')}</UserLink>
          </Col>
          <Col span={8}>
            <UserLink to="/">{t('header.user.friends')}</UserLink>
          </Col>
        </Row>
      </UserBody>
      
      <UserFooter>
        <Button 
          icon={<ProfileOutlined />}
          onClick={navigateToProfile}
        >
          {t('header.user.profile')}
        </Button>
        <Button 
          icon={<LogoutOutlined />}
          onClick={logOut}
        >
          {t('login.button.signOut')}
        </Button>
      </UserFooter>
    </DropdownContent>
  );

  return (
    <Dropdown 
      overlay={dropdownContent}
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      trigger={['click']}
      placement="bottomRight"
    >
      <StyledAvatar 
        src={currentUser?.photoURL || '/img/default-profile.png'} 
        size={25} 
        icon={<UserOutlined />} 
      />
    </Dropdown>
  );
};

export default UserDropdown;
