import { format, formatDistance } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

// Ant Design imports
import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Modal, Row, Spin, Table, Tag } from 'antd';

// Local imports
import { ConfirmModal } from '@app/components/ConfirmModal';
import ContentHeader from '@app/components/content-header/ContentHeader';
import { UserStatus } from '@app/types/user';

const UserProfile = () => {
  const { id } = useParams();
  const [t] = useTranslation();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessions, setSessions] = useState([]);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showRevokeSessionModal, setShowRevokeSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  
  // Reset password state
  const [password, setPassword] = useState('');
  
  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (id) {
        try {
          setLoading(true);
          const userData = await userService.getUserById(id);
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user:', error);
          toast.error(t('users.errors.fetchFailed'));
          navigate('/users');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchUser();
  }, [id, navigate, t]);
  
  // Fetch user sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (id) {
        try {
          setLoadingSessions(true);
          const sessionsData = await sessionService.getUserSessions(id);
          setSessions(sessionsData);
        } catch (error) {
          console.error('Error fetching user sessions:', error);
          toast.error(t('sessions.errors.fetchFailed'));
        } finally {
          setLoadingSessions(false);
        }
      }
    };
    
    fetchSessions();
  }, [id, t]);
  
  // Handle delete user
  const handleDeleteUser = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      await userService.deleteUser(id);
      toast.success(t('users.messages.deleteSuccess'));
      navigate('/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('users.errors.deleteFailed'));
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };
  
  // Handle lock/unlock user
  const handleToggleLock = async () => {
    if (!id || !user) return;
    
    try {
      setLoading(true);
      if (user.status === UserStatus.LOCKED) {
        await userService.unlockUser(id);
        toast.success(t('users.messages.unlockSuccess'));
      } else {
        await userService.lockUser(id);
        toast.success(t('users.messages.lockSuccess'));
      }
      
      // Refresh user data
      const updatedUser = await userService.getUserById(id);
      setUser(updatedUser);
    } catch (error) {
      console.error('Error toggling user lock status:', error);
      toast.error(t('users.errors.updateFailed'));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle reset password
  const handleResetPassword = async (password) => {
    if (!id) return;
    
    try {
      setLoading(true);
      await userService.resetUserPassword(id, password);
      toast.success(t('users.messages.passwordResetSuccess'));
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(t('users.errors.passwordResetFailed'));
    } finally {
      setLoading(false);
      setShowResetPasswordModal(false);
    }
  };
  
  // Handle revoke session
  const handleRevokeSession = (session) => {
    setSelectedSession(session);
    setShowRevokeSessionModal(true);
  };
  
  // Confirm revoke session
  const confirmRevokeSession = async () => {
    if (!id || !selectedSession) return;
    
    try {
      setLoading(true);
      await sessionService.revokeUserSession(id, selectedSession.id);
      toast.success(t('sessions.messages.revokeSuccess'));
      
      // Refresh sessions
      const updatedSessions = await sessionService.getUserSessions(id);
      setSessions(updatedSessions);
    } catch (error) {
      console.error('Error revoking session:', error);
      toast.error(t('sessions.errors.revokeFailed'));
    } finally {
      setLoading(false);
      setShowRevokeSessionModal(false);
      setSelectedSession(null);
    }
  };
  
  const renderSessionStatus = (session) => {
    if (session.isCurrent) {
      return <Tag color="blue">{t('sessions.current')}</Tag>;
    } else if (session.revokedAt) {
      return <Tag color="red">{t('sessions.revoked')}</Tag>;
    } else if (session.isExpired) {
      return <Tag color="orange">{t('sessions.expired')}</Tag>;
    } else if (session.active) {
      return <Tag color="green">{t('sessions.active')}</Tag>;
    } else {
      return <Tag color="gray">{t('sessions.inactive')}</Tag>;
    }
  };
  
  if (!user && !loading) {
    return <div>{t('users.userNotFound')}</div>;
  }
  
  return (
    <>
      <ContentHeader title={t('users.profileTitle')} />
      
      <section className="content">
        <div className="container">
          <Row gutter={16}>
            <Col span={8}>
              <Card title={t('users.profileTitle')}>
                <div style={{ textAlign: 'center' }}>
                  <img
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      borderRadius: '50%', 
                      objectFit: 'cover',
                      marginBottom: '16px'
                    }}
                    src={user?.photoURL || '/img/default-profile.png'}
                    alt={user?.fullName || user?.name || 'User'}
                  />
                </div>
                
                <h3 style={{ textAlign: 'center' }}>
                  {user?.fullName || user?.name || user?.username}
                </h3>
                
                <p style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)' }}>
                  {user?.roles && 
                    (Array.isArray(user.roles) 
                      ? user.roles.map(r => typeof r === 'string' ? r : r.name).join(', ')
                      : '')}
                </p>
                
                <div style={{ marginBottom: '16px' }}>
                  <Row style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Col span={12}><strong>{t('users.fields.username')}</strong></Col>
                    <Col span={12} style={{ textAlign: 'right' }}>{user?.username}</Col>
                  </Row>
                  <Row style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Col span={12}><strong>{t('users.fields.email')}</strong></Col>
                    <Col span={12} style={{ textAlign: 'right' }}>{user?.email}</Col>
                  </Row>
                  <Row style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Col span={12}><strong>{t('users.fields.status')}</strong></Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Tag 
                        color={user?.status === UserStatus.ACTIVE ? 'green' : 'red'}
                      >
                        {user?.status}
                      </Tag>
                    </Col>
                  </Row>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/users/edit/${id}`)}
                  >
                    {t('users.actions.edit')}
                  </Button>
                  
                  <Button
                    type={user?.status === UserStatus.LOCKED ? 'primary' : 'default'}
                    icon={user?.status === UserStatus.LOCKED ? <UnlockOutlined /> : <LockOutlined />}
                    onClick={handleToggleLock}
                  >
                    {user?.status === UserStatus.LOCKED ? t('users.actions.unlock') : t('users.actions.lock')}
                  </Button>
                  
                  <Button
                    type="default"
                    icon={<KeyOutlined />}
                    onClick={() => setShowResetPasswordModal(true)}
                  >
                    {t('users.actions.resetPassword')}
                  </Button>
                  
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setShowDeleteModal(true)}
                  >
                    {t('users.actions.delete')}
                  </Button>
                </div>
              </Card>
              
              <Card
                title={t('users.fields.lastSignIn')}
                style={{ marginTop: '16px' }}
              >
                <Row>
                  <Col span={24}>
                    <span style={{ fontWeight: 'bold' }}>
                      <i className="fas fa-calendar" style={{ marginRight: '4px' }}></i> 
                      {t('users.fields.lastSignIn')}
                    </span>
                    <p style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                      {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : t('profile.never')}
                    </p>
                  </Col>
                </Row>
              </Card>
            </Col>
            
            <Col span={16}>
              <Card title={t('sessions.history')}>
                {loadingSessions ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  <Table
                    dataSource={sessions}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    columns={[
                      {
                        title: t('sessions.device'),
                        dataIndex: 'deviceInfo',
                        key: 'deviceInfo',
                      },
                      {
                        title: t('sessions.ipAddress'),
                        dataIndex: 'ipAddress',
                        key: 'ipAddress',
                      },
                      {
                        title: t('sessions.loginTime'),
                        dataIndex: 'createdAt',
                        key: 'createdAt',
                        render: (text) => (
                          <span title={format(new Date(text), 'PPpp')}>
                            {formatDistance(new Date(text), new Date(), { addSuffix: true })}
                          </span>
                        ),
                      },
                      {
                        title: t('sessions.lastActivity'),
                        dataIndex: 'lastActivity',
                        key: 'lastActivity',
                        render: (text) => (
                          text ? (
                            <span title={format(new Date(text), 'PPpp')}>
                              {formatDistance(new Date(text), new Date(), { addSuffix: true })}
                            </span>
                          ) : '-'
                        ),
                      },
                      {
                        title: t('sessions.status'),
                        dataIndex: 'status',
                        key: 'status',
                        render: (text, record) => renderSessionStatus(record),
                      },
                      {
                        title: t('common.actions'),
                        key: 'actions',
                        render: (text, record) => (
                          record.active && !record.isExpired && !record.revokedAt && (
                            <Button
                              danger
                              size="small"
                              onClick={() => handleRevokeSession(record)}
                            >
                              {t('sessions.revoke')}
                            </Button>
                          )
                        ),
                      },
                    ]}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </section>
      
      {/* Delete User Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
        title={t('users.delete.title')}
        message={t('users.delete.confirmation')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        confirmVariant="danger"
      />
      
      {/* Reset Password Modal */}
      <Modal
        open={showResetPasswordModal}
        onCancel={() => setShowResetPasswordModal(false)}
        title={t('users.modals.resetPasswordTitle')}
        footer={[
          <Button key="cancel" onClick={() => setShowResetPasswordModal(false)}>
            {t('common.cancel')}
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => handleResetPassword(password)}
            disabled={!password}
          >
            {t('users.actions.resetPassword')}
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label={t('users.fields.newPassword')}>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('users.fields.newPassword')}
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Revoke Session Modal */}
      <ConfirmModal
        open={showRevokeSessionModal}
        onCancel={() => {
          setShowRevokeSessionModal(false);
          setSelectedSession(null);
        }}
        onConfirm={confirmRevokeSession}
        title={t('sessions.modals.revokeTitle')}
        message={t('sessions.modals.revokeMessage')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
      />
    </>
  );
};

export default UserProfile;