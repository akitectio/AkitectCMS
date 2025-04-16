import { FileImageOutlined, PlusOutlined, RollbackOutlined, SaveOutlined } from '@ant-design/icons';
import categoryService from '@app/services/categories';
import postService from '@app/services/posts';
import tagService from '@app/services/tags';
import { Category } from '@app/types/category';
import { PostCreateRequest, PostUpdateRequest, Tag } from '@app/types/post';
import { Button, Card, Col, DatePicker, Form, Input, message, Modal, Row, Select, Space, Spin, Switch } from 'antd';
import debounce from 'lodash/debounce';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
// Markdown editor imports
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import { useNavigate, useParams } from 'react-router-dom';

const { Option } = Select;

// Initialize a Markdown parser
const mdParser = new MarkdownIt();

interface PostFormProps {
  mode: 'create' | 'edit';
}

const PostForm: React.FC<PostFormProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [tagModalVisible, setTagModalVisible] = useState<boolean>(false);
  const [newTagName, setNewTagName] = useState<string>('');
  
  // States for Select2 search
  const [categorySearchText, setCategorySearchText] = useState('');
  const [categorySearching, setCategorySearching] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  
  // States for tag search/creation
  const [tagSearchText, setTagSearchText] = useState('');
  const [tagSearching, setTagSearching] = useState(false);
  const [tagOptions, setTagOptions] = useState<Tag[]>([]);

  // Debounced search handlers
  const debouncedCategorySearch = useMemo(
    () =>
      debounce(async (searchText: string) => {
        if (searchText.length > 0) {
          setCategorySearching(true);
          try {
            const results = await categoryService.searchCategories(searchText);
            setCategoryOptions(results);
          } catch (error) {
            console.error('Failed to search categories:', error);
            message.error('Failed to search categories');
          } finally {
            setCategorySearching(false);
          }
        } else {
          setCategoryOptions([]);
        }
      }, 500),
    []
  );

  const debouncedTagSearch = useMemo(
    () =>
      debounce(async (searchText: string) => {
        if (searchText.length > 0) {
          setTagSearching(true);
          try {
            const results = await tagService.searchTags(searchText);
            setTagOptions(results);
          } catch (error) {
            console.error('Failed to search tags:', error);
            message.error('Failed to search tags');
          } finally {
            setTagSearching(false);
          }
        } else {
          setTagOptions([]);
        }
      }, 500),
    []
  );

  // Load post data if editing
  useEffect(() => {
    const fetchData = async () => {
      // Fetch initial data
      try {
        // Load initial category and tag options
        const [categoriesData, tagsData] = await Promise.all([
          categoryService.getAllCategories(),
          tagService.getAllTags()
        ]);
        
        setCategories(categoriesData);
        setTags(tagsData);
        setCategoryOptions(categoriesData);
        setTagOptions(tagsData);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        message.error('Failed to load initial data');
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
            tagIds: post.tags?.map(tag => tag.id) || [],
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

  // Handle category search input change
  const handleCategorySearch = (value: string) => {
    setCategorySearchText(value);
    debouncedCategorySearch(value);
  };

  // Handle tag search input change
  const handleTagSearch = (value: string) => {
    setTagSearchText(value);
    debouncedTagSearch(value);
  };
  
  // Handle creating a new tag
  const handleCreateTag = async (tagName: string) => {
    try {
      const newTag = await tagService.createTagIfNotExists(tagName);
      setTagOptions([...tagOptions, newTag]);
      setTags([...tags, newTag]);
      
      // Select the newly created tag
      const currentTagIds = form.getFieldValue('tagIds') || [];
      form.setFieldsValue({
        tagIds: [...currentTagIds, newTag.id]
      });
      
      // Clear the search text after adding the tag
      setTagSearchText('');
      
      return newTag.id;
    } catch (error) {
      console.error('Failed to create tag:', error);
      message.error('Failed to create tag');
      return null;
    }
  };

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

  // Handle editor change
  const handleEditorChange = ({ text }: { text: string }) => {
    setContent(text);
  };

  // Handle showing tag creation modal
  const showTagModal = () => {
    setNewTagName('');
    setTagModalVisible(true);
  };

  // Handle creating tag from modal
  const handleCreateTagFromModal = async () => {
    if (!newTagName.trim()) {
      message.error('Tag name cannot be empty');
      return;
    }

    try {
      const result = await handleCreateTag(newTagName.trim());
      if (result) {
        setTagModalVisible(false);
        message.success(`Tag "${newTagName}" created successfully`);
      }
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

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
          <Row gutter={24}>
            {/* Left side - Main post content */}
            <Col xs={24} lg={16}>
              <Form.Item
                name="title"
                label="Name"
                rules={[{ required: true, message: 'Please enter the post title' }]}
              >
                <Input placeholder="Post title" />
              </Form.Item>

              <Form.Item
                name="slug"
                label="Permalink"
                rules={[{ pattern: /^[a-z0-9-]+$/, message: 'Slug can only contain lowercase letters, numbers, and hyphens' }]}
              >
                <Input 
                  placeholder="post-url-slug" 
                  addonBefore="https://shopwise.botble.com/blog/"
                />
              </Form.Item>

              <Form.Item
                name="excerpt"
                label="Description"
              >
                <Input.TextArea 
                  placeholder="Short description (optional)" 
                  rows={3}
                />
              </Form.Item>

              <Form.Item
                name="featured"
                label="Is featured?"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item label="Content">
                <MdEditor
                  style={{ height: '500px' }}
                  renderHTML={(text) => mdParser.render(text)}
                  onChange={handleEditorChange}
                  value={content}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="metaTitle"
                    label="Meta Title"
                  >
                    <Input placeholder="SEO title (if different from post title)" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="metaDescription"
                    label="Meta Description"
                  >
                    <Input.TextArea 
                      placeholder="SEO description" 
                      rows={4}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            {/* Right side - Sidebar with settings */}
            <Col xs={24} lg={8}>
              <Card title="Publish" size="small" className="mb-4">
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

                <Form.Item className="text-right mb-0">
                  <Space>
                    <Button
                      type="default"
                      onClick={() => navigate('/posts')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={loading}
                    >
                      {mode === 'create' ? 'Save' : 'Save & Exit'}
                    </Button>
                  </Space>
                </Form.Item>
              </Card>

              <Card title="Categories" size="small" className="mb-4">
                <Form.Item
                  name="categoryIds"
                  noStyle
                >
                  <Select
                    mode="multiple"
                    placeholder="Search categories"
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                    showSearch
                    filterOption={false}
                    onSearch={handleCategorySearch}
                    notFoundContent={categorySearching ? <Spin size="small" /> : null}
                  >
                    {categoryOptions.map(category => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Card>

              <Card title="Tags" size="small" className="mb-4">
                <Form.Item
                  name="tagIds"
                  noStyle
                >
                  <Select
                    mode="multiple"
                    placeholder="Tìm kiếm hoặc tạo tags"
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                    showSearch
                    filterOption={false}
                    onSearch={handleTagSearch}
                    notFoundContent={
                      tagSearching ? <Spin size="small" /> : (
                        tagSearchText ? (
                          <div 
                            style={{ 
                              padding: '8px', 
                              cursor: 'pointer',
                              textAlign: 'center'
                            }}
                            onClick={() => handleCreateTag(tagSearchText)}
                          >
                            <PlusOutlined style={{ marginRight: '5px' }} />
                            <span>Thêm tag "{tagSearchText}"</span>
                          </div>
                        ) : (
                          <div style={{ padding: '8px', textAlign: 'center', color: '#999' }}>
                            Nhập từ khóa để tìm hoặc tạo tag
                          </div>
                        )
                      )
                    }
                  >
                    {tagOptions.map(tag => (
                      <Option key={tag.id} value={tag.id}>
                        {tag.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Card>

              <Modal
                title="Tạo tag mới"
                open={tagModalVisible}
                onOk={handleCreateTagFromModal}
                onCancel={() => setTagModalVisible(false)}
                okText="Tạo"
                cancelText="Hủy"
              >
                <Form layout="vertical">
                  <Form.Item label="Tên tag">
                    <Input 
                      value={newTagName} 
                      onChange={(e) => setNewTagName(e.target.value)} 
                      placeholder="Nhập tên tag"
                    />
                  </Form.Item>
                </Form>
              </Modal>

              <Card title="Image" size="small">
                <Form.Item
                  name="featuredImageUrl"
                  noStyle
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
                <div className="mt-3 text-center">
                  {form.getFieldValue('featuredImageUrl') ? (
                    <img 
                      src={form.getFieldValue('featuredImageUrl')} 
                      alt="Featured" 
                      style={{ maxWidth: '100%', maxHeight: '200px' }} 
                    />
                  ) : (
                    <div className="placeholder-image-box">
                      <FileImageOutlined style={{ fontSize: '2rem' }} />
                      <p>No image selected</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card title="Additional Settings" size="small" className="mt-4">
                <Form.Item
                  name="allowComments"
                  label="Allow Comments"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default PostForm;