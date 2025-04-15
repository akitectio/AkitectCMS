import { FileImageOutlined, RollbackOutlined, SaveOutlined } from '@ant-design/icons';
import categoryService from '@app/services/categories';
import postService from '@app/services/posts';
import { Category } from '@app/types/category';
import { PostCreateRequest, PostUpdateRequest } from '@app/types/post';
import { Button, Card, DatePicker, Form, Input, message, Select, Space, Switch, Tabs } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate, useParams } from 'react-router-dom';

const { Option } = Select;
const { TabPane } = Tabs;

interface PostFormProps {
  mode: 'create' | 'edit';
}

const PostForm: React.FC<PostFormProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);

  // Load post data if editing
  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories regardless of mode
      try {
        const categoriesData = await categoryService.getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        message.error('Failed to load categories');
      }

      // Fetch post data if in edit mode
      if (mode === 'edit' && id) {
        setLoading(true);
        try {
          const post = await postService.getPost(id);
          
          // Format the data for the form
          const formData = {
            ...post,
            categoryIds: post.categories?.map(cat => cat.id) || [],
            publishedAt: post.publishedAt ? moment(post.publishedAt) : null
          };
          
          form.setFieldsValue(formData);
          setContent(post.content);
          setLoading(false);
        } catch (error) {
          console.error('Failed to fetch post:', error);
          message.error('Failed to load post data');
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [mode, id, form]);

  // Handle form submission
  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      const postData: PostCreateRequest | PostUpdateRequest = {
        ...values,
        content,
        publishedAt: values.publishedAt ? values.publishedAt.format() : null,
        featured: values.featured || false,
        allowComments: values.allowComments || false
      };

      if (mode === 'create') {
        await postService.createPost(postData as PostCreateRequest);
        message.success('Post created successfully');
        navigate('/posts');
      } else if (mode === 'edit' && id) {
        await postService.updatePost(id, postData as PostUpdateRequest);
        message.success('Post updated successfully');
        navigate('/posts');
      }
    } catch (error) {
      console.error('Failed to save post:', error);
      message.error('Failed to save post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Configure the rich text editor
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image', 'video'
  ];

  return (
    <div className="post-form-container">
      <Card 
        title={mode === 'create' ? 'Create New Post' : 'Edit Post'} 
        extra={
          <Space>
            <Button 
              icon={<RollbackOutlined />} 
              onClick={() => navigate('/posts')}
            >
              Back to Posts
            </Button>
          </Space>
        }
        loading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'DRAFT',
            featured: false,
            allowComments: true
          }}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="Basic Information" key="1">
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: 'Please enter the post title' }]}
              >
                <Input placeholder="Post title" />
              </Form.Item>

              <Form.Item
                name="slug"
                label="Slug (URL)"
                rules={[{ pattern: /^[a-z0-9-]+$/, message: 'Slug can only contain lowercase letters, numbers, and hyphens' }]}
              >
                <Input placeholder="post-url-slug" />
              </Form.Item>

              <Form.Item
                name="excerpt"
                label="Excerpt"
              >
                <Input.TextArea 
                  placeholder="Short excerpt or summary (optional)" 
                  rows={3}
                />
              </Form.Item>

              <Form.Item label="Content">
                <ReactQuill
                  theme="snow"
                  modules={quillModules}
                  formats={quillFormats}
                  value={content}
                  onChange={setContent}
                  style={{ height: '300px', marginBottom: '50px' }}
                />
              </Form.Item>
            </TabPane>

            <TabPane tab="Categories & Settings" key="2">
              <Form.Item
                name="categoryIds"
                label="Categories"
              >
                <Select
                  mode="multiple"
                  placeholder="Select categories"
                  optionFilterProp="children"
                >
                  {categories && categories.length > 0 ? categories.map(category => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  )) : null}
                </Select>
              </Form.Item>

              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select a status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="DRAFT">Draft</Option>
                  <Option value="PUBLISHED">Published</Option>
                  <Option value="SCHEDULED">Scheduled</Option>
                  <Option value="ARCHIVED">Archived</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="publishedAt"
                label="Publication Date"
                dependencies={['status']}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (getFieldValue('status') !== 'SCHEDULED' || value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Please set a publication date for scheduled posts'));
                    },
                  }),
                ]}
              >
                <DatePicker 
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="Select publication date and time"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="featuredImageUrl"
                label="Featured Image URL"
              >
                <Input 
                  placeholder="URL of featured image" 
                  addonAfter={
                    <FileImageOutlined 
                      onClick={() => setImageModalVisible(true)} 
                      style={{ cursor: 'pointer' }}
                    />
                  }
                />
              </Form.Item>

              <Form.Item
                name="featured"
                label="Featured Post"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="allowComments"
                label="Allow Comments"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </TabPane>

            <TabPane tab="SEO" key="3">
              <Form.Item
                name="metaTitle"
                label="Meta Title"
              >
                <Input placeholder="SEO title (if different from post title)" />
              </Form.Item>

              <Form.Item
                name="metaDescription"
                label="Meta Description"
              >
                <Input.TextArea 
                  placeholder="SEO description" 
                  rows={4}
                />
              </Form.Item>
            </TabPane>
          </Tabs>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              {mode === 'create' ? 'Create Post' : 'Update Post'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PostForm;