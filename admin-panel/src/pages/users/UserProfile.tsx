import { ConfirmModal } from '@app/components/ConfirmModal';
import ContentHeader from '@app/components/content-header/ContentHeader';
import sessionService from '@app/services/sessions';
import userService from '@app/services/users';
import { UserStatus } from '@app/types/user';
import { format, formatDistance } from 'date-fns';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

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
      return <Badge bg="primary">{t('sessions.current')}</Badge>;
    } else if (session.revokedAt) {
      return <Badge bg="danger">{t('sessions.revoked')}</Badge>;
    } else if (session.isExpired) {
      return <Badge bg="warning">{t('sessions.expired')}</Badge>;
    } else if (session.active) {
      return <Badge bg="success">{t('sessions.active')}</Badge>;
    } else {
      return <Badge bg="secondary">{t('sessions.inactive')}</Badge>;
    }
  };
  
  if (!user && !loading) {
    return <div>{t('users.userNotFound')}</div>;
  }
  
  return (
    <>
      <ContentHeader title={t('users.profileTitle')} />
      
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              <Card className="card-primary card-outline">
                <Card.Body className="box-profile">
                  <div className="text-center">
                    <img
                      className="profile-user-img img-fluid img-circle"
                      src={user?.photoURL || '/img/default-profile.png'}
                      alt={user?.fullName || user?.name || 'User'}
                    />
                  </div>
                  
                  <h3 className="profile-username text-center">
                    {user?.fullName || user?.name || user?.username}
                  </h3>
                  
                  <p className="text-muted text-center">
                    {user?.roles && 
                      (Array.isArray(user.roles) 
                        ? user.roles.map(r => typeof r === 'string' ? r : r.name).join(', ')
                        : '')}
                  </p>
                  
                  <ul className="list-group list-group-unbordered mb-3">
                    <li className="list-group-item">
                      <b>{t('users.fields.username')}</b> <a className="float-right">{user?.username}</a>
                    </li>
                    <li className="list-group-item">
                      <b>{t('users.fields.email')}</b> <a className="float-right">{user?.email}</a>
                    </li>
                    <li className="list-group-item">
                      <b>{t('users.fields.status')}</b> 
                      <a className="float-right">
                        <Badge 
                          bg={user?.status === UserStatus.ACTIVE ? 'success' : 'danger'}
                        >
                          {user?.status}
                        </Badge>
                      </a>
                    </li>
                  </ul>
                  
                  <Button
                    block
                    className="mb-1"
                    variant="primary"
                    onClick={() => navigate(`/users/edit/${id}`)}
                  >
                    <i className="fas fa-edit"></i> {t('users.actions.edit')}
                  </Button>
                  
                  <Button
                    block
                    className="mb-1"
                    variant={user?.status === UserStatus.LOCKED ? 'success' : 'warning'}
                    onClick={handleToggleLock}
                  >
                    <i className={`fas fa-${user?.status === UserStatus.LOCKED ? 'unlock' : 'lock'}`}></i>
                    {' '}
                    {user?.status === UserStatus.LOCKED ? t('users.actions.unlock') : t('users.actions.lock')}
                  </Button>
                  
                  <Button
                    block
                    className="mb-1"
                    variant="info"
                    onClick={() => setShowResetPasswordModal(true)}
                  >
                    <i className="fas fa-key"></i> {t('users.actions.resetPassword')}
                  </Button>
                  
                  <Button
                    block
                    variant="danger"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <i className="fas fa-trash"></i> {t('users.actions.delete')}
                  </Button>
                </Card.Body>
              </Card>
              
              <Card className="card-primary">
                <Card.Header>
                  <h3 className="card-title">{t('users.fields.lastSignIn')}</h3>
                </Card.Header>
                <Card.Body>
                  <strong>
                    <i className="fas fa-calendar mr-1"></i> {t('users.fields.lastSignIn')}
                  </strong>
                  <p className="text-muted">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : t('profile.never')}
                  </p>
                </Card.Body>
              </Card>
            </div>
            
            <div className="col-md-8">
              <Card className="card-primary card-outline">
                <Card.Header>
                  <h3 className="card-title">{t('sessions.history')}</h3>
                </Card.Header>
                <Card.Body>
                  {loadingSessions ? (
                    <div className="text-center p-4">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">{t('common.loading')}</span>
                      </Spinner>
                    </div>
                  ) : (
                    <Table responsive striped hover>
                      <thead>
                        <tr>
                          <th>{t('sessions.device')}</th>
                          <th>{t('sessions.ipAddress')}</th>
                          <th>{t('sessions.loginTime')}</th>
                          <th>{t('sessions.lastActivity')}</th>
                          <th>{t('sessions.status')}</th>
                          <th>{t('common.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center">
                              {t('sessions.noSessions')}
                            </td>
                          </tr>
                        ) : (
                          sessions.map((session) => (
                            <tr key={session.id}>
                              <td>{session.deviceInfo}</td>
                              <td>{session.ipAddress}</td>
                              <td title={format(new Date(session.createdAt), 'PPpp')}>
                                {formatDistance(new Date(session.createdAt), new Date(), { addSuffix: true })}
                              </td>
                              <td title={format(new Date(session.lastActivity), 'PPpp')}>
                                {formatDistance(new Date(session.lastActivity), new Date(), { addSuffix: true })}
                              </td>
                              <td>{renderSessionStatus(session)}</td>
                              <td>
                                {session.active && !session.isExpired && !session.revokedAt && (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleRevokeSession(session)}
                                  >
                                    {t('sessions.revoke')}
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Delete User Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
        title={t('users.delete.title')}
        message={t('users.delete.confirmation')}
      />
      
      {/* Reset Password Modal */}
      <Modal show={showResetPasswordModal} onHide={() => setShowResetPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('users.modals.resetPasswordTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>{t('users.fields.newPassword')}</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('users.fields.newPassword')}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetPasswordModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleResetPassword(password)}
            disabled={!password}
          >
            {t('users.actions.resetPassword')}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Revoke Session Modal */}
      <ConfirmModal
        show={showRevokeSessionModal}
        onHide={() => {
          setShowRevokeSessionModal(false);
          setSelectedSession(null);
        }}
        onConfirm={confirmRevokeSession}
        title={t('sessions.modals.revokeTitle')}
        message={t('sessions.modals.revokeMessage')}
      />
    </>
  );
};

export default UserProfile;