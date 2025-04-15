import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    SafetyOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { fetchPermissionsRequest } from '@app/store/reducers/permissions';
import { deleteRoleRequest, fetchRolesRequest, resetRoleState } from '@app/store/reducers/roles';
import { useAppDispatch, useAppSelector } from '@app/store/store';
import { ContentHeader } from '@components';
import { Button, Card, Col, Input, Modal, Row, Space, Table, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const { Text, Title } = Typography;

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

const Roles = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { 
    items: roles, 
    loading, 
    deleting, 
    error, 
    success,
    currentPage,
    totalPages,
    total
  } = useAppSelector((state) => state.roles);
  const { items: permissions } = useAppSelector((state) => state.permissions);

  // Local state for UI
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  
  // State for permissions modal
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<string[]>([]);
  const [selectedRoleName, setSelectedRoleName] = useState('');
  
  // Pagination and sorting state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('name');
  const [direction, setDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Load roles when component mounts or when pagination/sorting changes
  useEffect(() => {
    dispatch(fetchRolesRequest({ page, size, sortBy, direction, search: searchQuery }));
    // Fetch permissions to display their names in the modal
    dispatch(fetchPermissionsRequest({}));
  }, [dispatch, page, size, sortBy, direction, searchQuery]);

  // Reset form state after success
  useEffect(() => {
    if (success) {
      if (showDeleteModal) setShowDeleteModal(false);
      
      // Reset the redux success state
      setTimeout(() => {
        dispatch(resetRoleState());
      }, 2000);
    }
  }, [success, dispatch, showDeleteModal]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      
      // Reset the redux error state
      setTimeout(() => {
        dispatch(resetRoleState());
      }, 2000);
    }
  }, [error, dispatch]);

  // Open permissions modal
  const handleOpenPermissionsModal = (role) => {
    if (!role.permissionIds || role.permissionIds.length === 0) {
      return; // Don't open modal if no permissions
    }
    
    setSelectedRolePermissions(role.permissionIds);
    setSelectedRoleName(role.name);
    setShowPermissionsModal(true);
  };

  // Get permission name by id
  const getPermissionName = (permissionId: string) => {
    const permission = permissions?.find(p => p.id === permissionId);
    return permission ? permission.name : t('permissions.noPermissions');
  };

  // Handle delete role
  const handleDeleteRole = () => {
    if (!selectedRoleId) return;
    
    dispatch(deleteRoleRequest(selectedRoleId));
  };

  // Open delete modal
  const handleOpenDeleteModal = (roleId: string) => {
    setSelectedRoleId(roleId);
    setShowDeleteModal(true);
  };

  // Handle search
  const handleSearch = () => {
    setPage(0); // Reset to first page when searching
    dispatch(fetchRolesRequest({ page: 0, size, sortBy, direction, search: searchQuery }));
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value === '') {
      setPage(0);
      dispatch(fetchRolesRequest({ page: 0, size, sortBy, direction, search: '' }));
    }
  };

  // Handle page change
  const handlePageChange = (page: number, pageSize: number) => {
    const newPage = page - 1; // Convert to 0-based for API
    setPage(newPage);
    setSize(pageSize);
    dispatch(fetchRolesRequest({ page: newPage, size: pageSize, sortBy, direction, search: searchQuery }));
  };

  // Handle table sort
  const handleTableChange = (_pagination, _filters, sorter) => {
    if (sorter && sorter.field) {
      const newSortBy = sorter.field;
      const newDirection = sorter.order === 'ascend' ? 'asc' : 'desc';
      
      setSortBy(newSortBy);
      setDirection(newDirection);
      dispatch(fetchRolesRequest({ page, size, sortBy: newSortBy, direction: newDirection, search: searchQuery }));
    }
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: t('roles.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: t('roles.description'),
      dataIndex: 'description',
      key: 'description',
      sorter: true,
    },
    {
      title: t('roles.permissions'),
      key: 'permissions',
      render: (_, record) => (
        <Button 
          type="link" 
          disabled={!record.permissionIds?.length} 
          onClick={() => handleOpenPermissionsModal(record)}
          icon={<EyeOutlined />}
        >
          {t('roles.permissionsCount', { count: record.permissionIds?.length || 0 })}
        </Button>
      ),
    },
    {
      title: t('roles.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Link to={`/roles/${record.id}/edit`}>
            <Tooltip title={t('roles.edit')}>
              <Button type="primary" icon={<EditOutlined />} size="small" />
            </Tooltip>
          </Link>
          <Tooltip title={t('roles.delete')}>
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
              onClick={() => handleOpenDeleteModal(record.id)}
              loading={deleting && selectedRoleId === record.id}
            />
          </Tooltip>
        </Space>
      ),
    }
  ];

  return (
    <>
      <ContentHeader title={t('roles.management')} />
      
      <Card
        title={
          <Space>
            <SafetyOutlined />
            {t('roles.list')}
          </Space>
        }
        extra={
          <Link to="/roles/create">
            <Button type="primary" icon={<PlusOutlined />}>
              {t('roles.addNew')}
            </Button>
          </Link>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Row gutter={24} align="middle">
            <Col xs={24} md={12}>
              <SearchWrapper>
                <Input 
                  placeholder={t('roles.search')}
                  value={searchQuery}
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
          </Row>
        </div>
        
        <Table
          dataSource={roles || []}
          columns={columns}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: page + 1, // Convert to 1-based for display
            pageSize: size,
            total: total,
            onChange: handlePageChange,
            showSizeChanger: true,
            showTotal: (total) => `${t('pagination.total')}: ${total} ${t('pagination.items')}`,
          }}
          bordered
        />
      </Card>

      {/* Delete Role Modal */}
      <Modal 
        open={showDeleteModal} 
        onCancel={() => setShowDeleteModal(false)}
        title={t('roles.delete.title')}
        footer={[
          <Button key="cancel" onClick={() => setShowDeleteModal(false)}>
            {t('roles.delete.button.cancel')}
          </Button>,
          <Button 
            key="delete" 
            danger 
            loading={deleting}
            onClick={handleDeleteRole}
          >
            {t('roles.delete.button.confirm')}
          </Button>
        ]}
      >
        <p>{t('roles.delete.confirmation')}</p>
        <div style={{ backgroundColor: '#fffbe6', padding: 16, borderRadius: 4, border: '1px solid #ffe58f', marginTop: 16 }}>
          <Text type="warning">
            <SafetyOutlined style={{ marginRight: 8 }} />
            {t('roles.delete.warning')}
          </Text>
        </div>
      </Modal>

      {/* Permissions Modal */}
      <Modal 
        open={showPermissionsModal} 
        onCancel={() => setShowPermissionsModal(false)}
        title={
          <Space>
            <SafetyOutlined />
            {t('roles.permissionsModal.title', { name: selectedRoleName })}
          </Space>
        }
        footer={[
          <Button key="close" onClick={() => setShowPermissionsModal(false)}>
            {t('roles.permissionsModal.close')}
          </Button>
        ]}
        width={700}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Space size="middle" direction="vertical">
              <div className="spinner-border text-primary" role="status" />
              <Text>{t('common.loading')}</Text>
            </Space>
          </div>
        ) : (
          selectedRolePermissions.length > 0 ? (
            <Table 
              dataSource={selectedRolePermissions.map((id, index) => ({
                key: id,
                id: id,
                index: index + 1,
                name: getPermissionName(id)
              }))}
              columns={[
                { 
                  title: '#', 
                  dataIndex: 'index', 
                  key: 'index',
                  width: 60 
                },
                { 
                  title: t('roles.permissionsModal.permissionName'),
                  dataIndex: 'name', 
                  key: 'name' 
                }
              ]}
              pagination={{ pageSize: 10 }}
              scroll={{ y: 300 }}
              bordered
            />
          ) : (
            <div style={{ backgroundColor: '#e6f7ff', padding: 16, borderRadius: 4, border: '1px solid #91d5ff' }}>
              <Text type="info">
                {t('roles.permissionsModal.noPermissions')}
              </Text>
            </div>
          )
        )}
      </Modal>
    </>
  );
};

export default Roles;