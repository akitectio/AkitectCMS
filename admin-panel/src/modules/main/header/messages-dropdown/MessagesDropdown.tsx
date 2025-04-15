import { ClockCircleOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons';
import { Avatar, Badge, Divider, Dropdown, List, Typography } from 'antd';
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
  width: 320px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.1);
  padding: 0;
`;

const MessageItem = styled.div`
  display: flex;
  padding: 10px;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const MessageContent = styled.div`
  margin-left: 10px;
  flex: 1;
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const MessageTitle = styled(Text)`
  font-weight: bold;
  font-size: 14px;
`;

const MessageText = styled(Text)`
  font-size: 13px;
  display: block;
`;

const MessageTime = styled(Text)`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
`;

const MessageFooter = styled(Link)`
  display: block;
  text-align: center;
  padding: 10px;
  font-weight: bold;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

// Messages data
const messages = [
  {
    id: 1,
    name: 'Brad Diesel',
    avatar: '/img/default-profile.png',
    content: 'Call me whenever you can...',
    time: '30',
    unit: 'Minutes',
    importance: 'danger'
  },
  {
    id: 2,
    name: 'John Pierce',
    avatar: '/img/default-profile.png',
    content: 'I got your message bro',
    time: '3',
    unit: 'Hours',
    importance: 'default'
  },
  {
    id: 3,
    name: 'Nora Silvester',
    avatar: '/img/default-profile.png',
    content: 'The subject goes here',
    time: '4',
    unit: 'Hours',
    importance: 'warning'
  }
];

const MessagesDropdown = () => {
  const [t] = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Get the star color based on importance
  const getStarColor = (importance: string) => {
    switch (importance) {
      case 'danger':
        return '#ff4d4f';
      case 'warning':
        return '#faad14';
      default:
        return '#bfbfbf';
    }
  };

  const dropdownContent = (
    <DropdownContainer>
      <List
        dataSource={messages}
        renderItem={(item) => (
          <>
            <Link to="/">
              <MessageItem>
                <Avatar src={item.avatar} size={50} />
                <MessageContent>
                  <MessageHeader>
                    <MessageTitle>{item.name}</MessageTitle>
                    <StarOutlined style={{ color: getStarColor(item.importance) }} />
                  </MessageHeader>
                  <MessageText>{item.content}</MessageText>
                  <MessageTime>
                    <ClockCircleOutlined style={{ marginRight: 5 }} />
                    {t('header.messages.ago', {
                      quantity: item.time,
                      unit: item.unit,
                    })}
                  </MessageTime>
                </MessageContent>
              </MessageItem>
            </Link>
            <Divider style={{ margin: 0 }} />
          </>
        )}
      />
      <MessageFooter to="/">
        {t('header.messages.seeAll')}
      </MessageFooter>
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
        <Badge count={3} size="small">
          <MessageOutlined style={{ fontSize: '18px' }} />
        </Badge>
      </StyledDropdownButton>
    </Dropdown>
  );
};

export default MessagesDropdown;
