import { useEffect, useState } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faKey, faLock, faLockOpen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import ContentHeader from '@app/components/content-header/ContentHeader';
import { OverlayLoading } from '@app/components/OverlayLoading';
import { ConfirmModal } from '@app/components/ConfirmModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import userService from '@app/services/users';
import { User, UserStatus } from '@app/types/user';

const UserProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState<boolean>(false);
  
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
  const handleResetPassword = async (password: string) => {
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
                    {user?.fullName || user?.name}
                  </h3>
                  <p className="text-muted text-center">{user?.username}</p>
                  
                  <ul className="list-group list-group-unbordered mb-3">
                    <li className="list-group-item">
                      <b>{t('users.fields.email')}</b>
                      <a className="float-right">{user?.email}</a>
                    </li>
                    <li className="list-group-item">
                      <b>{t('users.fields.status')}</b>
                      <span
                        className={`float-right badge ${
                          user?.status === UserStatus.ACTIVE
                            ? 'badge-success'
                            : 'badge-danger'
                        }`}
                      >
                        {user?.status || UserStatus.ACTIVE}
                      </span>
                    </li>
                    <li className="list-group-item">
                      <b>{t('users.fields.createdAt')}</b>
                      <span className="float-right">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : '-'}
                      </span>
                    </li>
                    <li className="list-group-item">
                      <b>{t('users.fields.lastSignIn')}</b>
                      <span className="float-right">
                        {user?.metadata?.lastSignInTime
                          ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                          : '-'}
                      </span>
                    </li>
                  </ul>
                  
                  <div className="d-flex justify-content-between">
                    <Link to={`/users/edit/${id}`} className="btn btn-primary btn-block">
                      <FontAwesomeIcon icon={faEdit} className="mr-1" />
                      {t('users.actions.edit')}
                    </Link>
                    <Button
                      variant={user?.status === UserStatus.LOCKED ? 'success' : 'warning'}
                      className="btn-block"
                      onClick={handleToggleLock}
                    >
                      <FontAwesomeIcon
                        icon={user?.status === UserStatus.LOCKED ? faLockOpen : faLock}
                        className="mr-1"
                      />
                      {user?.status === UserStatus.LOCKED
                        ? t('users.actions.unlock')
                        : t('users.actions.lock')}
                    </Button>
                  </div>
                  
                  <div className="d-flex justify-content-between mt-2">
                    <Button
                      variant="secondary"
                      className="btn-block"
                      onClick={() => setShowResetPasswordModal(true)}
                    >
                      <FontAwesomeIcon icon={faKey} className="mr-1" />
                      {t('users.actions.resetPassword')}
                    </Button>
                    <Button
                      variant="danger"
                      className="btn-block"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-1" />
                      {t('users.actions.delete')}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
            
            <div className="col-md-8">
              <Card className="card-primary card-outline">
                <Card.Header>
                  <h3 className="card-title">{t('users.roles.title')}</h3>
                </Card.Header>
                <Card.Body>
                  {user?.roles && user.roles.length > 0 ? (
                    <ul className="list-unstyled">
                      {user.roles.map((role, index) => (
                        <li key={index} className="mb-2">
                          <span className="badge badge-primary p-2">{role}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">{t('users.roles.none')}</p>
                  )}
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {loading && <OverlayLoading type="dark" />}
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title={t('users.modals.deleteTitle')}
        message={t('users.modals.deleteMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={handleDeleteUser}
        confirmVariant="danger"
      />
      
      {/* Reset Password Modal */}
      <ResetPasswordModal
        show={showResetPasswordModal}
        onHide={() => setShowResetPasswordModal(false)}
        onSubmit={handleResetPassword}
      />
    </>
  );
};

export default UserProfile;