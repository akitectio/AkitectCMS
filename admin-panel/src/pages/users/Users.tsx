import { ConfirmModal } from '@app/components/ConfirmModal';
import ContentHeader from '@app/components/content-header/ContentHeader';
import { OverlayLoading } from '@app/components/OverlayLoading';
import userService from '@app/services/users';
import { User, UserStatus } from '@app/types/user';
import {
  faEdit,
  faEye,
  faKey,
  faLock,
  faLockOpen,
  faPlus,
  faSearch,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Button, Card, Col, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ResetPasswordModal } from './ResetPasswordModal';

const Users = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageSize] = useState<number>(10);
  const [sortBy] = useState<string>('id');
  const [sortDirection] = useState<string>('asc');
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmModalData, setConfirmModalData] = useState<{ userId: number, currentStatus: boolean } | null>(null);
  
  // Load users
  const fetchUsers = async (page = currentPage) => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers({
        page,
        size: pageSize,
        sortBy,
        direction: sortDirection,
        search: searchTerm,
      });
      
      // Add null checks and default values to prevent errors
      setUsers(response?.users || []);
      setCurrentPage(response?.currentPage || 0);
      setTotalItems(response?.totalItems || 0);
      setTotalPages(response?.totalPages || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t('users.errors.fetchFailed'));
      // Set default values when error occurs
      setUsers([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Handle search
  const handleSearch = () => {
    setCurrentPage(0);
    fetchUsers(0);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page);
  };
  
  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    
    try {
      setLoading(true);
      await userService.deleteUser(selectedUserId);
      toast.success(t('users.messages.deleteSuccess'));
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('users.errors.deleteFailed'));
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSelectedUserId(null);
    }
  };
  
  // Handle lock/unlock user
  const handleToggleLock = async (userId: number, currentStatus: UserStatus) => {
    try {
      setLoading(true);
      if (currentStatus === UserStatus.LOCKED) {
        await userService.unlockUser(userId);
        toast.success(t('users.messages.unlockSuccess'));
      } else {
        await userService.lockUser(userId);
        toast.success(t('users.messages.lockSuccess'));
      }
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user lock status:', error);
      toast.error(t('users.errors.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle super admin
  const handleToggleSuperAdmin = async (userId: number, currentStatus: boolean) => {
    setShowConfirmModal(true);
    setConfirmModalData({
      userId,
      currentStatus,
    });
  };

  const confirmToggleSuperAdmin = async () => {
    const { userId, currentStatus } = confirmModalData;
    try {
      setLoading(true);
      await userService.toggleSuperAdmin(userId, !currentStatus);
      toast.success(t('users.messages.updateSuccess'));
      fetchUsers();
    } catch (error) {
      console.error('Error toggling super admin status:', error);
      toast.error(t('users.errors.updateFailed'));
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };
  
  // Handle reset password
  const handleResetPassword = async (password: string) => {
    if (!selectedUserId) return;
    
    try {
      setLoading(true);
      await userService.resetUserPassword(selectedUserId, password);
      toast.success(t('users.messages.passwordResetSuccess'));
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(t('users.errors.passwordResetFailed'));
    } finally {
      setLoading(false);
      setShowResetPasswordModal(false);
      setSelectedUserId(null);
    }
  };
  
  return (
    <>
      <ContentHeader title={t('users.title')} />
      
      <section className="content">
        <div className="container-fluid">
          <Card>
            <Card.Header>
              <Row>
                <Col md={6}>
                  <InputGroup>
                    <Form.Control
                      placeholder={t('users.search')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <InputGroup.Append>
                      <Button variant="primary" onClick={handleSearch}>
                        <FontAwesomeIcon icon={faSearch} />
                      </Button>
                    </InputGroup.Append>
                  </InputGroup>
                </Col>
                <Col md={6} className="text-right">
                  <Link to="/users/create">
                    <Button variant="success">
                      <FontAwesomeIcon icon={faPlus} className="mr-1" />
                      {t('users.actions.create')}
                    </Button>
                  </Link>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="position-relative">
                <Table responsive hover striped>
                  <thead>
                    <tr>
                      <th>{t('users.fields.username')}</th>
                      <th>{t('users.fields.email')}</th>
                      <th>{t('users.fields.fullName')}</th>
                      <th>{t('users.fields.status')}</th>
                      <th>{t('users.fields.createdAt')}</th>
                      <th>{t('users.fields.superAdmin')}</th>
                      <th className="text-center">{t('users.fields.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>{user.fullName || user.name}</td>
                          <td>
                            <span
                              className={`badge ${
                                user.status === UserStatus.ACTIVE
                                  ? 'badge-success'
                                  : 'badge-danger'
                              }`}
                            >
                              {user.status || UserStatus.ACTIVE}
                            </span>
                          </td>
                          <td>
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : '-'}
                          </td>
                          <td>
                            <Form.Check
                              type="switch"
                              id={`super-admin-switch-${user.id}`}
                              checked={user.superAdmin}
                              onChange={() => handleToggleSuperAdmin(user.id, user.superAdmin)}
                              label={user.superAdmin ? t('common.yes') : t('common.no')}
                            />
                          </td>
                          <td className="text-center">
                            <div className="btn-group">
                              <Link
                                to={`/users/profile/${user.id}`}
                                className="btn btn-info btn-sm"
                                title={t('users.actions.view')}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </Link>
                              <Link
                                to={`/users/edit/${user.id}`}
                                className="btn btn-primary btn-sm"
                                title={t('users.actions.edit')}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </Link>
                              <Button
                                variant={user.status === UserStatus.LOCKED ? 'success' : 'warning'}
                                size="sm"
                                title={
                                  user.status === UserStatus.LOCKED
                                    ? t('users.actions.unlock')
                                    : t('users.actions.lock')
                                }
                                onClick={() => handleToggleLock(user.id, user.status || UserStatus.ACTIVE)}
                              >
                                <FontAwesomeIcon
                                  icon={user.status === UserStatus.LOCKED ? faLockOpen : faLock}
                                />
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                title={t('users.actions.resetPassword')}
                                onClick={() => {
                                  setSelectedUserId(user.id);
                                  setShowResetPasswordModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faKey} />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                title={t('users.actions.delete')}
                                onClick={() => {
                                  setSelectedUserId(user.id);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center">
                          {t('users.noData')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                {loading && <OverlayLoading />}
              </div>
            </Card.Body>
            <Card.Footer>
              <Row>
                <Col sm={12} md={5}>
                  <div className="dataTables_info">
                    {t('pagination.showing')} {users.length > 0 ? currentPage * pageSize + 1 : 0}{' '}
                    {t('pagination.to')}{' '}
                    {Math.min((currentPage + 1) * pageSize, totalItems)} {t('pagination.of')}{' '}
                    {totalItems} {t('pagination.entries')}
                  </div>
                </Col>
                <Col sm={12} md={7}>
                  <div className="dataTables_paginate paging_simple_numbers">
                    <ul className="pagination m-0 float-right">
                      <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                        <Button
                          variant="link"
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 0}
                        >
                          {t('pagination.previous')}
                        </Button>
                      </li>
                      {[...Array(totalPages)].map((_, index) => (
                        <li
                          key={index}
                          className={`page-item ${currentPage === index ? 'active' : ''}`}
                        >
                          <Button
                            variant="link"
                            className="page-link"
                            onClick={() => handlePageChange(index)}
                          >
                            {index + 1}
                          </Button>
                        </li>
                      ))}
                      <li
                        className={`page-item ${
                          currentPage === totalPages - 1 ? 'disabled' : ''
                        }`}
                      >
                        <Button
                          variant="link"
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages - 1}
                        >
                          {t('pagination.next')}
                        </Button>
                      </li>
                    </ul>
                  </div>
                </Col>
              </Row>
            </Card.Footer>
          </Card>
        </div>
      </section>
      
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

      {/* Confirm Super Admin Toggle Modal */}
      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        title={t('users.modals.superAdminTitle')}
        message={t('users.modals.superAdminMessage')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        onConfirm={confirmToggleSuperAdmin}
      />
    </>
  );
};

export default Users;