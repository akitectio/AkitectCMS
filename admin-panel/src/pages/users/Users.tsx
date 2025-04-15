import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  LockOutlined,
  PlusOutlined,
  SearchOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import { ConfirmModal } from '@app/components/ConfirmModal';
import ContentHeader from '@app/components/content-header/ContentHeader';
import userService from '@app/services/users';
import { User, UserStatus } from '@app/types/user';
import { Button, Card, Col, Input, Row, Space, Switch, Table, Tag, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { ResetPasswordModal } from './ResetPasswordModal';

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  
  .ant-input-affix-wrapper {
    width: 250px;
  }
`;

const ActionButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Users = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy] = useState<string>('id');
  const [sortDirection] = useState<string>('asc');
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmModalData, setConfirmModalData] = useState<{ userId: number, currentStatus: boolean } | null>(null);
  
  // Load users
  const fetchUsers = async (page = currentPage, pageSizeParam = pageSize) => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers({
        page,
        size: pageSizeParam,
        sortBy,
        direction: sortDirection,
        search: searchTerm,
      });
      
      // Add null checks and default values to prevent errors
      setUsers(response?.users || []);
      setCurrentPage(response?.currentPage || 0);
      setTotalItems(response?.totalItems || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t('users.errors.fetchFailed'));
      // Set default values when error occurs
      setUsers([]);
      setTotalItems(0);
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
  
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      // Clear search
      setCurrentPage(0);
      fetchUsers(0, pageSize);
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number, pageSize?: number) => {
    const newPage = page - 1; // Convert to 0-based for API
    setCurrentPage(newPage);
    if (pageSize) setPageSize(pageSize);
    fetchUsers(newPage, pageSize || 10);
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

  // Table columns
  const columns = [
    {
      title: t('users.fields.username'),
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: t('users.fields.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('users.fields.fullName'),
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: User) => text || record.name || '-',
    },
    {
      title: t('users.fields.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: UserStatus) => (
        <Tag color={status === UserStatus.ACTIVE ? 'success' : 'error'}>
          {status || UserStatus.ACTIVE}
        </Tag>
      ),
    },
    {
      title: t('users.fields.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: t('users.fields.superAdmin'),
      dataIndex: 'superAdmin',
      key: 'superAdmin',
      render: (superAdmin: boolean, record: User) => (
        <Switch
          checked={superAdmin}
          onChange={() => handleToggleSuperAdmin(record.id, superAdmin)}
          checkedChildren={t('common.yes')}
          unCheckedChildren={t('common.no')}
        />
      ),
    },
    {
      title: t('users.fields.actions'),
      key: 'actions',
      render: (_, record: User) => (
        <Space>
          <Link to={`/users/${record.id}/edit`}>
            <Tooltip title={t('users.actions.edit')}>
              <Button type="default" icon={<EditOutlined />} size="small" />
            </Tooltip>
          </Link>
          
          <Tooltip title={record.status === UserStatus.LOCKED ? t('users.actions.unlock') : t('users.actions.lock')}>
            <Button 
              type="primary" 
              danger={record.status !== UserStatus.LOCKED}
              icon={record.status === UserStatus.LOCKED ? <UnlockOutlined /> : <LockOutlined />} 
              size="small"
              onClick={() => handleToggleLock(record.id, record.status || UserStatus.ACTIVE)}
            />
          </Tooltip>
          
          <Tooltip title={t('users.actions.resetPassword')}>
            <Button 
              type="default" 
              icon={<KeyOutlined />} 
              size="small"
              onClick={() => {
                setSelectedUserId(record.id);
                setShowResetPasswordModal(true);
              }}
            />
          </Tooltip>
          
          <Tooltip title={t('users.actions.delete')}>
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
              onClick={() => {
                setSelectedUserId(record.id);
                setShowDeleteModal(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  return (
    <>
      <ContentHeader title={t('users.title')} />
      
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={24} align="middle">
            <Col xs={24} md={12}>
              <SearchWrapper>
                <Input 
                  placeholder={t('users.search')}
                  value={searchTerm}
                  onChange={onSearchChange}
                  onPressEnter={handleSearch}
                  prefix={<SearchOutlined />}
                  allowClear
                />
                <Button type="primary" onClick={handleSearch} style={{ marginLeft: 8 }}>
                  {t('common.search')}
                </Button>
              </SearchWrapper>
            </Col>
            <Col xs={24} md={12}>
              <ActionButtonsWrapper>
                <Link to="/users/create">
                  <Button type="primary" icon={<PlusOutlined />}>
                    {t('users.actions.create')}
                  </Button>
                </Link>
              </ActionButtonsWrapper>
            </Col>
          </Row>
        </div>
        
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage + 1, // Convert to 1-based for display
            pageSize: pageSize,
            total: totalItems,
            onChange: handlePageChange,
            showSizeChanger: true,
            showTotal: (total) => `${t('pagination.total')}: ${total} ${t('pagination.items')}`,
          }}
          bordered
        />
      </Card>
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        title={t('users.modals.deleteTitle')}
        message={t('users.modals.deleteMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={handleDeleteUser}
        confirmVariant="danger"
      />
      
      {/* Reset Password Modal */}
      <ResetPasswordModal
        open={showResetPasswordModal}
        onCancel={() => setShowResetPasswordModal(false)}
        onSubmit={handleResetPassword}
      />

      {/* Confirm Super Admin Toggle Modal */}
      <ConfirmModal
        open={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
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