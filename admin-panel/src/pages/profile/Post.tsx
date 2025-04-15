import { CloseOutlined, CommentOutlined, LikeOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Divider, Form, Input, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const { Text, Paragraph } = Typography;

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const UserInfo = styled.div`
  margin-left: 12px;
  flex-grow: 1;
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
`;

const Post = ({ isClearfix = false }: { isClearfix?: boolean }) => {
  return (
    <Card bordered={false} style={{ marginBottom: 16 }}>
      <UserInfoContainer>
        <Avatar 
          src="/img/default-profile.png" 
          alt="User" 
          size={40}
        />
        <UserInfo>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong><Link to="/">Jonathan Burke Jr.</Link></Text>
            <Button 
              type="text" 
              size="small" 
              icon={<CloseOutlined />} 
            />
          </div>
          <Text type="secondary">Shared publicly - 7:30 PM today</Text>
        </UserInfo>
      </UserInfoContainer>
      
      <Paragraph>
        Lorem ipsum represents a long-held tradition for designers, typographers
        and the like. Some people hate it and argue for its demise, but others
        ignore the hate as they create awesome tools to help create filler text
        for everyone from bacon lovers to Charlie Sheen fans.
      </Paragraph>
      
      <ActionsContainer>
        <Space>
          <Link to="/">
            <Space size="small">
              <ShareAltOutlined />
              Share
            </Space>
          </Link>
          <Link to="/">
            <Space size="small">
              <LikeOutlined />
              Like
            </Space>
          </Link>
        </Space>
        
        <Link to="/">
          <Space size="small">
            <CommentOutlined />
            Comments (5)
          </Space>
        </Link>
      </ActionsContainer>
      
      <Divider style={{ margin: '16px 0' }} />
      
      <Form layout="inline" style={{ display: 'flex' }}>
        <Form.Item style={{ flex: 1, marginRight: 8 }}>
          <Input placeholder="Response" />
        </Form.Item>
        <Form.Item style={{ marginRight: 0 }}>
          <Button type="primary" htmlType="submit">
            Send
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Post;
