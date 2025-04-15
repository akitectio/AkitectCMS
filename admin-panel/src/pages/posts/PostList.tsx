import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import categoryService from '@app/services/categories';
import postService from '@app/services/posts';
import { Category } from '@app/types/category';
import { Post, PostFilterParams } from '@app/types/post';
import { Button, Input, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const { Option } = Select;

const PostList: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  // Fetch posts with filters
  const fetchPosts = async (filters: PostFilterParams = {}) => {
    setLoading(true);
    try {
      const result = await postService.getAllPosts({
        page: currentPage - 1, // API might be zero-based
        size: pageSize,
        search: searchText || undefined,
        status: selectedStatus,
        categoryId: selectedCategory,
        ...filters
      });
      setPosts(result.posts);
      setTotalItems(result.totalItems);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      message.error('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for filter dropdown
  const fetchCategories = async () => {
    try {
      const result = await categoryService.getAllCategories();
      setCategories(result);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Load posts on initial render and when filters change
  useEffect(() => {
    fetchPosts();
  }, [currentPage, pageSize, searchText, selectedStatus, selectedCategory]);

  // Load categories on initial render
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle search input
  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle status filter change
  const handleStatusChange = (value: string | undefined) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  // Handle category filter change
  const handleCategoryChange = (value: string | undefined) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  // Handle pagination change
  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Handle delete post
  const handleDeletePost = async (id: string) => {
    try {
      await postService.deletePost(id);
      message.success('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      message.error('Failed to delete post. Please try again later.');
    }
  };

  // Define table columns
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Post) => (
        <Link to={`/posts/edit/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = status === 'PUBLISHED' ? 'green' : status === 'DRAFT' ? 'gold' : 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Author',
      dataIndex: 'authorFullName',
      key: 'authorFullName',
      render: (text: string, record: Post) => text || record.authorUsername,
    },
    {
      title: 'Categories',
      key: 'categories',
      render: (text: string, record: Post) => (
        <span>
          {record.categories?.map((category) => (
            <Tag key={category.id}>{category.name}</Tag>
          ))}
        </span>
      ),
    },
    {
      title: 'Published Date',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Views',
      dataIndex: 'viewsCount',
      key: 'viewsCount',
      sorter: (a: Post, b: Post) => a.viewsCount - b.viewsCount,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: Post) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/posts/edit/${record.id}`)}
          >
            Edit
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => window.open(`/posts/${record.id}`, '_blank')}
          >
            View
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this post?"
            onConfirm={() => handleDeletePost(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="post-list-container">
      <div style={{ marginBottom: 16 }}>
        <Space size="large" style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/posts/create')}
          >
            Create New Post
          </Button>
          
          <Input
            placeholder="Search posts..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => handleSearch(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          
          <Select
            placeholder="Filter by status"
            style={{ width: 150 }}
            allowClear
            onChange={handleStatusChange}
            value={selectedStatus}
          >
            <Option value="PUBLISHED">Published</Option>
            <Option value="DRAFT">Draft</Option>
            <Option value="SCHEDULED">Scheduled</Option>
            <Option value="ARCHIVED">Archived</Option>
          </Select>
          
          <Select
            placeholder="Filter by category"
            style={{ width: 200 }}
            allowClear
            onChange={handleCategoryChange}
            value={selectedCategory}
          >
            {categories && categories.length > 0 ? categories.map(category => (
              <Option key={category.id} value={category.id}>{category.name}</Option>
            )) : null}
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={posts}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalItems,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Total ${total} posts`,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default PostList;