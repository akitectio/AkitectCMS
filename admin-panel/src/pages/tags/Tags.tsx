import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { ConfirmModal } from '@app/components/ConfirmModal';
import ContentHeader from '@app/components/content-header/ContentHeader';
import tagService from '@app/services/tags';
import { Tag } from '@app/types/post';
import { Button, Card, Col, Form, Input, Modal, Row, Space, Table, Typography, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const { Text } = Typography;

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

// Interface for the form data
interface TagFormData {
  id?: string;
  name: string;
  slug: string;
  description?: string;
}

const Tags: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  
  // State for tags data
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [tagToEdit, setTagToEdit] = useState<Tag | null>(null);
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Fetch tags on component mount and when search/pagination changes
  useEffect(() => {
    fetchTags();
  }, [currentPage, pageSize, searchQuery]);

  // Fetch tags from the API
  const fetchTags = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would use pagination from the API
      // For now, we'll fetch all tags and implement client-side pagination
      const fetchedTags = await tagService.getAllTags();
      
      // Filter tags by search query if any
      const filteredTags = searchQuery
        ? fetchedTags.filter(tag => 
            tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : fetchedTags;
      
      setTags(filteredTags);
      setTotalItems(filteredTags.length);
    } catch (error) {
      console.error('Error fetching tags:', error);
      message.error(t('tags.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle search button click
  const handleSearch = () => {
    setCurrentPage(0); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page - 1); // API uses 0-based indexing
    if (size && size !== pageSize) {
      setPageSize(size);
    }
  };

  // Open create tag modal
  const showCreateModal = () => {
    setModalTitle(t('tags.addNew'));
    setModalMode('create');
    setTagToEdit(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Open edit tag modal
  const showEditModal = (tag: Tag) => {
    setModalTitle(t('tags.edit'));
    setModalMode('edit');
    setTagToEdit(tag);
    form.setFieldsValue({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
    });
    setIsModalVisible(true);
  };

  // Handle modal cancel (close)
  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  // Handle form submission (create or edit)
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (modalMode === 'create') {
        await tagService.createTag(values);
        message.success(t('tags.createSuccess'));
      } else if (modalMode === 'edit' && tagToEdit) {
        await tagService.updateTag(tagToEdit.id, values);
        message.success(t('tags.updateSuccess'));
      }
      
      setIsModalVisible(false);
      fetchTags(); // Refresh the tag list
    } catch (error) {
      console.error('Error saving tag:', error);
      message.error(t('tags.saveError'));
    }
  };

  // Open delete confirmation modal
  const showDeleteConfirm = (tag: Tag) => {
    setTagToDelete(tag);
    setShowDeleteModal(true);
  };

  // Handle tag deletion
  const handleDeleteTag = async () => {
    if (!tagToDelete) return;
    
    setDeleting(true);
    try {
      await tagService.deleteTag(tagToDelete.id);
      message.success(t('tags.deleteSuccess'));
      fetchTags(); // Refresh the tag list
    } catch (error) {
      console.error('Error deleting tag:', error);
      message.error(t('tags.deleteError'));
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setTagToDelete(null);
    }
  };

  // Generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    form.setFieldsValue({ slug });
  };

  // Table columns
  const columns = [
    {
      title: t('tags.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Tag, b: Tag) => a.name.localeCompare(b.name),
    },
    {
      title: t('tags.slug'),
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: Tag) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            size="small"
          >
            {t('common.edit')}
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
            size="small"
          >
            {t('common.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ContentHeader title={t('tags.management')} />
      
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={24} align="middle">
            <Col xs={24} md={12}>
              <SearchWrapper>
                <Input 
                  placeholder={t('tags.search')}
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
            <Col xs={24} md={12}>
              <ActionButtonsWrapper>
                <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
                  {t('tags.addNew')}
                </Button>
              </ActionButtonsWrapper>
            </Col>
          </Row>
        </div>
        
        <Table
          dataSource={tags}
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
      
      {/* Tag Form Modal */}
      <Modal
        title={modalTitle}
        open={isModalVisible}
        onCancel={handleModalCancel}
        onOk={handleSubmit}
        okText={modalMode === 'create' ? t('common.create') : t('common.save')}
        cancelText={t('common.cancel')}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item 
            name="name" 
            label={t('tags.name')} 
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input 
              placeholder={t('tags.namePlaceholder')} 
              onChange={handleNameChange}
            />
          </Form.Item>
          
          <Form.Item 
            name="slug" 
            label={t('tags.slug')}
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Input placeholder={t('tags.slugPlaceholder')} />
          </Form.Item>
          
          <Form.Item 
            name="description" 
            label={t('tags.description')}
          >
            <Input.TextArea 
              placeholder={t('tags.descriptionPlaceholder')}
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteTag}
        title={t('tags.delete.title')}
        message={
          <>
            {t('tags.delete.confirmation')} 
            <Text strong>{tagToDelete?.name}</Text>?
          </>
        }
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        confirmVariant="danger"
      />
    </>
  );
};

export default Tags;