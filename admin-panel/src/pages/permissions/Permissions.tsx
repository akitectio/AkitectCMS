import {
    DeleteOutlined,
    EditOutlined,
    LockOutlined,
    PlusOutlined,
    SearchOutlined
} from '@ant-design/icons';
import {
    createPermissionRequest,
    deletePermissionRequest,
    fetchPermissionsRequest,
    resetPermissionState,
    updatePermissionRequest
} from '@app/store/reducers/permissions';
import { useAppDispatch, useAppSelector } from '@app/store/store';
import { Permission } from '@app/types/user';
import { ContentHeader } from '@components';
import {
    Button,
    Card,
    Col,
    Form,
    Input,
    Modal,
    Row,
    Space,
    Table,
    Tooltip,
    Typography
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const { Text } = Typography;
const { Item: FormItem } = Form;

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

const Permissions = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { 
    items: permissions, 
    loading, 
    creating, 
    updating, 
    deleting, 
    error, 
    success,
    currentPage,
    totalPages,
    total
  } = useAppSelector((state) => state.permissions);

  // Local state for UI
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  
  // Pagination and sorting state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('name');
  const [direction, setDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [form] = Form.useForm();

  // Load permissions when component mounts or when pagination/sorting changes
  useEffect(() => {
    fetchPermissions();
  }, [page, size, sortBy, direction, searchQuery]);

  // Reset form state after success
  useEffect(() => {
    if (success) {
      if (showCreateModal) setShowCreateModal(false);
      if (showEditModal) setShowEditModal(false);
      if (showDeleteModal) setShowDeleteModal(false);
      
      // Reset the redux success state
      setTimeout(() => {
        dispatch(resetPermissionState());
      }, 2000);
    }
  }, [success, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      
      // Reset the redux error state
      setTimeout(() => {
        dispatch(resetPermissionState());
      }, 2000);
    }
  }, [error, dispatch]);

  // Fetch permissions
  const fetchPermissions = () => {
    dispatch(fetchPermissionsRequest({ page, size, sortBy, direction, search: searchQuery }));
  };

  // Handle search
  const handleSearch = () => {
    setPage(0); // Reset to first page when searching
    fetchPermissions();
  };
  
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value === '') {
      setPage(0);
      dispatch(fetchPermissionsRequest({ page: 0, size, sortBy, direction, search: '' }));
    }
  };

  // Handle page change
  const handlePageChange = (page: number, pageSize: number) => {
    const newPage = page - 1; // Convert to 0-based for API
    setPage(newPage);
    setSize(pageSize);
    dispatch(fetchPermissionsRequest({ page: newPage, size: pageSize, sortBy, direction, search: searchQuery }));
  };

  // Handle table sort
  const handleTableChange = (_pagination, _filters, sorter) => {
    if (sorter && sorter.field) {
      const newSortBy = sorter.field;
      const newDirection = sorter.order === 'ascend' ? 'asc' : 'desc';
      
      setSortBy(newSortBy);
      setDirection(newDirection);
      dispatch(fetchPermissionsRequest({ page, size, sortBy: newSortBy, direction: newDirection, search: searchQuery }));
    }
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    // Reset form
    setFormName('');
    setFormDescription('');
    form.resetFields();
    setShowCreateModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setFormName(permission.name);
    setFormDescription(permission.description);
    form.setFieldsValue({
      name: permission.name,
      description: permission.description
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDeleteModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setShowDeleteModal(true);
  };

  // Handle create permission
  const handleCreatePermission = () => {
    form.validateFields().then(values => {
      dispatch(createPermissionRequest({
        name: values.name,
        description: values.description
      }));
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  // Handle update permission
  const handleUpdatePermission = () => {
    if (!selectedPermission) return;
    
    form.validateFields().then(values => {
      dispatch(updatePermissionRequest({
        id: selectedPermission.id,
        name: values.name,
        description: values.description
      }));
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  // Handle delete permission
  const handleDeletePermission = () => {
    if (!selectedPermission) return;
    
    dispatch(deletePermissionRequest({ id: selectedPermission.id }));
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
      title: t('permissions.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: t('permissions.description'),
      dataIndex: 'description',
      key: 'description',
      sorter: true,
    },
    {
      title: t('permissions.actions'),
      key: 'actions',
      render: (_, record: Permission) => (
        <Space>
          <Tooltip title={t('permissions.edit')}>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleOpenEditModal(record)}
            />
          </Tooltip>
          
          <Tooltip title={t('permissions.delete')}>
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
              onClick={() => handleOpenDeleteModal(record)}
              loading={deleting && selectedPermission?.id === record.id}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <>
      <ContentHeader title={t('permissions.management')} />
      
      <Card
        title={
          <Space>
            <LockOutlined />
            {t('permissions.list')}
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleOpenCreateModal}
            loading={creating}
          >
            {t('permissions.addNew')}
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Row gutter={24} align="middle">
            <Col xs={24} md={12}>
              <SearchWrapper>
                <Input 
                  placeholder={t('permissions.search')}
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
          dataSource={permissions || []}
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

      {/* Create Permission Modal */}
      <Modal 
        title={t('permissions.form.createTitle')}
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowCreateModal(false)}>
            {t('permissions.form.cancel')}
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={creating}
            onClick={handleCreatePermission}
          >
            {t('permissions.form.create')}
          </Button>
        ]}
      >
        <Form form={form} layout="vertical">
          <FormItem
            name="name"
            label={t('permissions.name')}
            rules={[{ required: true, message: t('permissions.form.nameRequired') }]}
          >
            <Input placeholder={t('permissions.form.namePlaceholder')} />
          </FormItem>
          
          <FormItem
            name="description"
            label={t('permissions.description')}
            rules={[{ required: true, message: t('permissions.form.descriptionRequired') }]}
          >
            <Input placeholder={t('permissions.form.descriptionPlaceholder')} />
          </FormItem>
        </Form>
      </Modal>

      {/* Edit Permission Modal */}
      <Modal 
        title={t('permissions.form.editTitle')}
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowEditModal(false)}>
            {t('permissions.form.cancel')}
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={updating}
            onClick={handleUpdatePermission}
          >
            {t('permissions.form.update')}
          </Button>
        ]}
      >
        <Form form={form} layout="vertical">
          <FormItem
            name="name"
            label={t('permissions.name')}
            rules={[{ required: true, message: t('permissions.form.nameRequired') }]}
          >
            <Input placeholder={t('permissions.form.namePlaceholder')} />
          </FormItem>
          
          <FormItem
            name="description"
            label={t('permissions.description')}
            rules={[{ required: true, message: t('permissions.form.descriptionRequired') }]}
          >
            <Input placeholder={t('permissions.form.descriptionPlaceholder')} />
          </FormItem>
        </Form>
      </Modal>

      {/* Delete Permission Modal */}
      <Modal 
        title={t('permissions.delete.title')}
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowDeleteModal(false)}>
            {t('permissions.delete.button.cancel')}
          </Button>,
          <Button 
            key="delete" 
            danger 
            loading={deleting}
            onClick={handleDeletePermission}
          >
            {t('permissions.delete.button.confirm')}
          </Button>
        ]}
      >
        <p>
          {t('permissions.delete.confirmation')}
          <strong> {selectedPermission?.name}</strong>?
        </p>
        <div style={{ backgroundColor: '#fffbe6', padding: 16, borderRadius: 4, border: '1px solid #ffe58f', marginTop: 16 }}>
          <Text type="warning">
            <LockOutlined style={{ marginRight: 8 }} />
            {t('permissions.delete.warning')}
          </Text>
        </div>
      </Modal>
    </>
  );
};

export default Permissions;