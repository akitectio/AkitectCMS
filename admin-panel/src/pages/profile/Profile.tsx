import {
  ClockCircleOutlined,
  EditOutlined,
  HistoryOutlined,
  KeyOutlined,
  MailOutlined,
  SafetyOutlined,
  UserOutlined
} from '@ant-design/icons';
import userService from '@app/services/users';
import { useAppSelector } from '@app/store/store';
import { User } from '@app/types/user';
import { Avatar, Badge, Button, Card, Col, Descriptions, Divider, message, Row, Spin, Tabs, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Profile: React.FC = () => {
  const [t] = useTranslation();
  const { currentUser } = useAppSelector(state => state.auth);
  const { items: roles } = useAppSelector(state => state.roles);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getRoleNames = (roleIds: string[]) => {
    return roleIds
      .map(roleId => roles.find(role => role.id === roleId)?.name ?? roleId)
      .join(', ');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        if (currentUser?.id) {
          const userData = await userService.getUserById(currentUser.id);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        message.error(t('profile.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, t]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={4}>{t('profile.userNotFound')}</Title>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>{t('profile.title')}</Title>

      <Row gutter={[24, 24]}>
        {/* Profile Information */}
        <Col xs={24} md={8}>
          <Card bordered={false}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Avatar 
                size={100} 
                src={user.avatarUrl ?? '/img/default-profile.png'} 
                alt={user.fullName ?? user.name ?? 'User avatar'} 
              />
              <Title level={4} style={{ marginTop: '16px', marginBottom: '4px' }}>
                {user.fullName ?? user.name ?? user.username}
              </Title>
              {user.roleIds && (
                <Text type="secondary">{getRoleNames(user.roleIds)}</Text>
              )}
              <div style={{ marginTop: '16px' }}>
                <Link to="/profile/edit">
                  <Button type="primary" icon={<EditOutlined />}>
                    {t('profile.editProfile')}
                  </Button>
                </Link>
              </div>
            </div>

            <Divider />

            <Descriptions title={t('profile.about')} column={1}>
              <Descriptions.Item 
                label={t('profile.username')} 
                labelStyle={{ fontWeight: 'bold' }}
              >
                <UserOutlined style={{ marginRight: '8px' }} />
                {user.username}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={t('profile.email')} 
                labelStyle={{ fontWeight: 'bold' }}
              >
                <MailOutlined style={{ marginRight: '8px' }} />
                {user.email}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={t('profile.lastLogin')} 
                labelStyle={{ fontWeight: 'bold' }}
              >
                <ClockCircleOutlined style={{ marginRight: '8px' }} />
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : t('profile.never')}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Account Management */}
        <Col xs={24} md={16}>
          <Card 
            bordered={false}
            title={t('profile.accountManagement')}
          >
            <Tabs defaultActiveKey="1">
              <TabPane 
                tab={
                  <span>
                    <KeyOutlined />
                    {t('profile.securitySettings')}
                  </span>
                } 
                key="1"
              >
                <Card bordered={false}>
                  <Paragraph>{t('profile.securitySettingsDesc')}</Paragraph>
                  <Link to="/profile/change-password">
                    <Button type="primary">
                      {t('profile.changePassword')}
                    </Button>
                  </Link>
                </Card>
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <HistoryOutlined />
                    {t('profile.sessionManagement')}
                  </span>
                } 
                key="2"
              >
                <Card bordered={false}>
                  <Paragraph>{t('profile.sessionManagementDesc')}</Paragraph>
                  <Link to="/profile/sessions">
                    <Button type="primary">
                      {t('profile.viewSessions')}
                    </Button>
                  </Link>
                </Card>
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <SafetyOutlined />
                    {t('profile.accountStatus')}
                  </span>
                } 
                key="3"
              >
                <Card bordered={false}>
                  <Paragraph>{t('profile.accountStatusDesc')}</Paragraph>
                  <div>
                    <Text strong>{t('profile.status')}: </Text>
                    <Badge 
                      status={user.status === 'ACTIVE' ? 'success' : 'error'} 
                      text={user.status} 
                    />
                  </div>
                </Card>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
