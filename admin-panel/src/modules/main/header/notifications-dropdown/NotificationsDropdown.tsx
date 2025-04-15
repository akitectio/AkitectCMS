import {
  BellOutlined,
  FileOutlined,
  MailOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Badge, Divider, Dropdown, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const { Text, Title } = Typography;

const StyledDropdownButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0 8px;
`;

const DropdownContainer = styled.div`
  width: 300px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
  padding: 0;
`;

const NotificationHeader = styled.div`
  padding: 10px 15px;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid #f4f4f4;
`;

const NotificationItem = styled(Link)`
  display: flex;
  padding: 10px 15px;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const NotificationContent = styled.div`
  display: flex;
  align-items: center;
`;

const NotificationIcon = styled.div`
  margin-right: 10px;
  color: #3c8dbc;
  font-size: 18px;
  display: flex;
  align-items: center;
`;

const NotificationTime = styled(Text)`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
`;

const NotificationFooter = styled(Link)`
  display: block;
  text-align: center;
  padding: 10px;
  font-weight: bold;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

// Notification data
const notifications = [
  {
    id: 1,
    icon: <MailOutlined />,
    content: 'newMessagesCount',
    params: { quantity: '4' },
    time: { quantity: '3', unit: 'mins' }
  },
  {
    id: 2,
    icon: <TeamOutlined />,
    content: 'friendRequestsCount',
    params: { quantity: '5' },
    time: { quantity: '12', unit: 'hours' }
  },
  {
    id: 3,
    icon: <FileOutlined />,
    content: 'reportsCount',
    params: { quantity: '3' },
    time: { quantity: '2', unit: 'days' }
  }
];

const NotificationsDropdown = () => {
  const [t] = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const dropdownContent = (
    <DropdownContainer>
      <NotificationHeader>
        {t('header.notifications.count', { quantity: '15' })}
      </NotificationHeader>
      
      {notifications.map((notification) => (
        <div key={notification.id}>
          <NotificationItem to="/">
            <NotificationContent>
              <NotificationIcon>
                {notification.icon}
              </NotificationIcon>
              <Text>
                {t(`header.notifications.${notification.content}`, notification.params)}
              </Text>
            </NotificationContent>
            <NotificationTime>
              {t('measurement.quantityUnit', notification.time)}
            </NotificationTime>
          </NotificationItem>
          <Divider style={{ margin: 0 }} />
        </div>
      ))}
      
      <NotificationFooter to="/">
        {t('header.notifications.seeAll')}
      </NotificationFooter>
    </DropdownContainer>
  );

  return (
    <Dropdown 
      overlay={dropdownContent}
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      trigger={['click']}
      placement="bottomRight"
    >
      <StyledDropdownButton>
        <Badge count={15} size="small">
          <BellOutlined style={{ fontSize: '18px' }} />
        </Badge>
      </StyledDropdownButton>
    </Dropdown>
  );
};

export default NotificationsDropdown;
