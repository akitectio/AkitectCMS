import { DeleteOutlined, EditOutlined, EyeOutlined, FilterOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { ConfirmModal } from '@app/components/ConfirmModal';
import api from '@app/services/api';
import { Button, Card, Col, Form, Input, Row, Select, Space, Table, Tag, message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: 'draft' | 'published' | 'scheduled' | 'private';
  categoryId: string;
  categoryName: string;
  authorName: string;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
}

const PostsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<{
    status?: string;
    categoryId?: string;
  }>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      // Handle different possible response structures
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
        setCategories(response.data.content);
      } else {
        setCategories([]);
        console.warn('Unexpected categories response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error(t('posts.errors.fetchFailed'));
      setCategories([]);
    }
  }, [t]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage - 1,
        size: pageSize,
        search: searchText || undefined,
        ...filters
      };
      
      const response = await api.get('/posts', { params });
      // Handle different possible response structures
      if (response.data && response.data.content) {
        // Paginated response format
        setPosts(response.data.content);
        setTotal(response.data.totalElements || response.data.content.length);
      } else if (Array.isArray(response.data)) {
        // Array response format
        setPosts(response.data);
        setTotal(response.data.length);
      } else {
        // Unexpected format
        setPosts([]);
        setTotal(0);
        console.warn('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      message.error(t('posts.errors.fetchFailed'));
      setPosts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchText, filters, t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filters: { status?: string; categoryId?: string }) => {
    setFilters(prev => ({ ...prev, ...filters }));
    setCurrentPage(1);
  };

  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    
    try {
      await api.delete(`/posts/${postToDelete.id}`);
      message.success(t('posts.messages.deleteSuccess'));
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      message.error(t('posts.errors.deleteFailed'));
    } finally {
      setDeleteModalVisible(false);
      setPostToDelete(null);
    }
  };

  const getStatusTag = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: 'default',
      published: 'success',
      scheduled: 'processing',
      private: 'warning'
    };
    
    return (
      <Tag color={statusColors[status] || 'default'}>
        {t(`posts.status.${status}`)}
      </Tag>
    );
  };

  const columns: ColumnsType<Post> = [
    {
      title: t('posts.fields.title'),
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => <Link to={`/posts/view/${record.id}`}>{text}</Link>
    },
    {
      title: t('posts.fields.category'),
      dataIndex: 'categoryName',
      key: 'category',
    },
    {
      title: t('posts.fields.author'),
      dataIndex: 'authorName',
      key: 'author',
    },
    {
      title: t('posts.fields.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: t('posts.fields.publishDate'),
      dataIndex: 'publishDate',
      key: 'publishDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: t('posts.fields.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/posts/view/${record.id}`)}
            size="small"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/posts/edit/${record.id}`)}
            size="small"
            type="primary"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteClick(record)}
            size="small"
            danger
          />
        </Space>
      )
    }
  ];

  return (
    <>
      <Card
        title={t('posts.listTitle')}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/posts/add')}
          >
            {t('posts.addButton')}
          </Button>
        }
      >
        <Row gutter={[16, 16]} className="mb-3">
          <Col span={8}>
            <Input.Search
              placeholder={t('common.search')}
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
            />
          </Col>
          <Col span={16}>
            <Space>
              <Form.Item label={<FilterOutlined />} style={{ marginBottom: 0 }}>
                <Select
                  placeholder={t('posts.filters.byCategory')}
                  allowClear
                  style={{ width: 180 }}
                  onChange={(value) => handleFilterChange({ categoryId: value })}
                >
                  {categories && categories.length > 0 ? categories.map(category => (
                    <Select.Option key={category.id} value={category.id}>
                      {category.name}
                    </Select.Option>
                  )) : null}
                </Select>
              </Form.Item>
              
              <Form.Item label={<FilterOutlined />} style={{ marginBottom: 0 }}>
                <Select
                  placeholder={t('posts.filters.all')}
                  allowClear
                  style={{ width: 120 }}
                  onChange={(value) => handleFilterChange({ status: value })}
                >
                  <Select.Option value="published">{t('posts.status.published')}</Select.Option>
                  <Select.Option value="draft">{t('posts.status.draft')}</Select.Option>
                  <Select.Option value="scheduled">{t('posts.status.scheduled')}</Select.Option>
                  <Select.Option value="private">{t('posts.status.private')}</Select.Option>
                </Select>
              </Form.Item>
            </Space>
          </Col>
        </Row>
        
        <Table
          columns={columns}
          dataSource={posts}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: (page) => setCurrentPage(page),
            onShowSizeChange: (_, size) => {
              setPageSize(size);
              setCurrentPage(1);
            },
            showSizeChanger: true,
            showTotal: (total, range) => 
              t('pagination.showing') + ` ${range[0]}-${range[1]} ` + 
              t('pagination.of') + ` ${total} ` + t('pagination.entries')
          }}
        />
      </Card>
      
      <ConfirmModal
        show={deleteModalVisible}
        onHide={() => setDeleteModalVisible(false)}
        title={t('posts.modals.deleteTitle')}
        message={postToDelete ? t('posts.modals.deleteMessage', { title: postToDelete.title }) : ''}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={handleDeleteConfirm}
        confirmVariant="danger"
      />
    </>
  );
};

export default PostsPage;