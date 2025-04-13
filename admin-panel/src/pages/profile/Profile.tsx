import ContentHeader from '@app/components/content-header/ContentHeader';
import userService from '@app/services/users';
import { useAppSelector } from '@app/store/store';
import { User } from '@app/types/user';
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Profile: React.FC = () => {
  const [t] = useTranslation();
  const { currentUser } = useAppSelector(state => state.auth);
  const { items: roles } = useAppSelector(state => state.roles); // Lấy danh sách vai trò từ Redux store
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
        if (currentUser?.id) { // Simplified using optional chaining
          const userData = await userService.getUserById(currentUser.id);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error(t('profile.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, t]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>{t('profile.userNotFound')}</div>;
  }

  return (
    <>
      <ContentHeader title={t('profile.title')} />

      <section className="content">
        <div className="container-fluid">
          <Row>
            {/* Profile Information */}
            <Col md={4}>
              <Card className="card-primary card-outline">
                <Card.Body className="box-profile">
                  <div className="text-center">
                    <img
                      className="profile-user-img img-fluid img-circle"
                      src={user.avatarUrl ?? '/img/default-profile.png'} // Updated to nullish coalescing
                      alt={user.fullName ?? user.name ?? 'User avatar'} // Updated to nullish coalescing
                    />
                  </div>

                  <h3 className="profile-username text-center">
                    {user.fullName ?? user.name ?? user.username /* Updated to nullish coalescing */}
                  </h3>

                  {user.roleIds && (
                    <p className="text-muted text-center">
                      {getRoleNames(user.roleIds)}
                    </p>
                  )}

                  <Link to="/profile/edit">
                    <Button variant="primary" block>
                      {t('profile.editProfile')}
                    </Button>
                  </Link>
                </Card.Body>
              </Card>

              <Card className="card-primary">
                <Card.Header>
                  <h3 className="card-title">{t('profile.about')}</h3>
                </Card.Header>
                <Card.Body>
                  <strong>
                    <i className="fas fa-user mr-1"></i> {t('profile.username')}
                  </strong>
                  <p className="text-muted">{user.username}</p>

                  <hr />

                  <strong>
                    <i className="fas fa-envelope mr-1"></i> {t('profile.email')}
                  </strong>
                  <p className="text-muted">{user.email}</p>

                  <hr />

                  <strong>
                    <i className="fas fa-clock mr-1"></i> {t('profile.lastLogin')}
                  </strong>
                  <p className="text-muted">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : t('profile.never')}
                  </p>
                </Card.Body>
              </Card>
            </Col>

            {/* Account Management */}
            <Col md={8}>
              <Card className="card-primary card-outline">
                <Card.Header>
                  <h3 className="card-title">{t('profile.accountManagement')}</h3>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col sm={6}>
                      <Card>
                        <Card.Body>
                          <h5>
                            <i className="fas fa-key mr-2"></i>
                            {t('profile.securitySettings')}
                          </h5>
                          <p>{t('profile.securitySettingsDesc')}</p>
                          <Link to="/profile/change-password">
                            <Button variant="primary" size="sm">
                              {t('profile.changePassword')}
                            </Button>
                          </Link>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col sm={6}>
                      <Card>
                        <Card.Body>
                          <h5>
                            <i className="fas fa-history mr-2"></i>
                            {t('profile.sessionManagement')}
                          </h5>
                          <p>{t('profile.sessionManagementDesc')}</p>
                          <Link to="/profile/sessions">
                            <Button variant="primary" size="sm">
                              {t('profile.viewSessions')}
                            </Button>
                          </Link>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col sm={12}>
                      <Card>
                        <Card.Body>
                          <h5>
                            <i className="fas fa-shield-alt mr-2"></i>
                            {t('profile.accountStatus')}
                          </h5>
                          <p>
                            {t('profile.accountStatusDesc')}
                          </p>
                          <div>
                            <strong>{t('profile.status')}:</strong>{' '}
                            <span className={`badge bg-${user.status === 'ACTIVE' ? 'success' : 'danger'}`}>
                              {user.status}
                            </span>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </>
  );
};

export default Profile;
