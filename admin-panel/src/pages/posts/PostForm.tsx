import { ArrowLeftOutlined, InboxOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import api from '@app/services/api';
import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Space, Upload, message } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate, useParams } from 'react-router-dom';

interface PostFormProps {
  isView?: boolean;
}

interface Category {
  id: string;
  name: string;
}

const PostForm = ({ isView = false }: PostFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<string>('draft');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  
  const isEdit = !!id;
  const pageTitle = isEdit 
    ? isView 
      ? form.getFieldValue('title') || ''
      : t('posts.editTitle', { title: form.getFieldValue('title') || '' }) 
    : t('posts.createTitle');

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error(t('posts.errors.fetchFailed'));
    }
  }, [t]);

  const fetchPost = useCallback(async (postId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/posts/${postId}`);
      const post = response.data;
      
      form.setFieldsValue({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        categoryId: post.categoryId,
        status: post.status,
        publishDate: post.publishDate ? dayjs(post.publishDate) : null,
        tags: post.tags ? post.tags.join(', ') : '',
        metaTitle: post.metaTitle || post.title,
        metaDescription: post.metaDescription || post.excerpt
      });
      
      setStatus(post.status);
      
      if (post.featuredImage) {
        setFileList([
          {
            uid: '-1',
            name: 'featured-image',
            status: 'done',
            url: post.featuredImage
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      message.error(t('posts.errors.postNotFound'));
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  }, [form, navigate, t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (isEdit && id) {
      fetchPost(id);
    }
  }, [fetchPost, id, isEdit]);

  const handleStatusChange = (value: string) => {
    setStatus(value);
    
    if (value === 'scheduled' && !form.getFieldValue('publishDate')) {
      form.setFieldsValue({ publishDate: dayjs().add(1, 'day') });
    }
  };

  const handleFinish = async (values: any) => {
    if (isView) return;
    
    setSubmitting(true);
    try {
      // If a publish date is selected but status isn't scheduled, update the status
      if (values.publishDate && values.status !== 'scheduled') {
        const publishDate = values.publishDate.toDate();
        const now = new Date();
        if (publishDate > now) {
          values.status = 'scheduled';
        }
      }

      // Process tags from comma-separated string to array
      if (values.tags) {
        values.tags = values.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
      }

      // Handle featured image upload if changed
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj);
        const uploadResponse = await api.post('/uploads/images', formData);
        values.featuredImage = uploadResponse.data.url;
      } else if (fileList.length > 0 && fileList[0].url) {
        values.featuredImage = fileList[0].url;
      }

      if (isEdit && id) {
        await api.put(`/posts/${id}`, values);
        message.success(t('posts.messages.updateSuccess'));
      } else {
        await api.post('/posts', values);
        message.success(t('posts.messages.createSuccess'));
      }
      navigate('/posts');
    } catch (error) {
      console.error('Error saving post:', error);
      message.error(isEdit ? t('posts.errors.updateFailed') : t('posts.errors.createFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleUploadChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    setFileList(info.fileList.slice(-1)); // Keep only the latest file

    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const beforeUpload = (file: RcFile) => {
    const isImage = /image\/(jpeg|png|gif|webp|jpg)/.test(file.type);
    if (!isImage) {
      message.error('You can only upload image files!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }
    return isImage && isLt2M;
  };

  // For custom upload handling (without actual upload during the change event)
  const customRequest = ({ onSuccess }: any) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-generate slug if slug is empty
    if (!form.getFieldValue('slug')) {
      const title = e.target.value;
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      form.setFieldValue('slug', slug);
    }
  };

  return (
    <Card
      title={pageTitle}
      loading={loading}
      extra={
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/posts')}
          >
            {t('common.back')}
          </Button>
          
          {!isView && (
            <>
              <Button
                type="default"
                icon={<SaveOutlined />}
                onClick={() => form.submit()}
                loading={submitting}
              >
                {t('posts.form.saveAsDraft')}
              </Button>
              
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => {
                  form.setFieldsValue({ status: 'published' });
                  form.submit();
                }}
                loading={submitting}
              >
                {t('posts.form.publishNow')}
              </Button>
            </>
          )}
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          status: 'draft',
          publishDate: null
        }}
        disabled={isView || loading}
      >
        <Row gutter={16}>
          <Col xs={24} lg={16}>
            <Form.Item
              name="title"
              label={t('posts.form.title')}
              rules={[
                { required: true, message: t('posts.validation.titleRequired') }
              ]}
            >
              <Input placeholder={t('posts.form.titlePlaceholder')} onChange={handleTitleChange} />
            </Form.Item>

            <Form.Item
              name="slug"
              label={t('posts.form.slug')}
              rules={[
                { 
                  pattern: /^[a-z0-9-]+$/, 
                  message: t('posts.validation.slugFormat') 
                }
              ]}
            >
              <Input placeholder={t('posts.form.slugPlaceholder')} />
            </Form.Item>
            
            <Form.Item
              name="content"
              label={t('posts.form.content')}
            >
              <ReactQuill
                theme="snow"
                placeholder={t('posts.editor.placeholder')}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                    ['link', 'image'],
                    ['clean']
                  ]
                }}
              />
            </Form.Item>

            <Form.Item
              name="excerpt"
              label={t('posts.form.excerpt')}
            >
              <Input.TextArea 
                rows={3} 
                placeholder={t('posts.form.excerptPlaceholder')} 
              />
            </Form.Item>

            <h3>{t('posts.form.seoSection')}</h3>
            
            <Form.Item
              name="metaTitle"
              label={t('posts.form.metaTitle')}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="metaDescription"
              label={t('posts.form.metaDescription')}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
          
          <Col xs={24} lg={8}>
            <Form.Item
              name="categoryId"
              label={t('posts.form.category')}
              rules={[
                { required: true, message: t('posts.validation.categoryRequired') }
              ]}
            >
              <Select placeholder={t('posts.form.selectCategory')}>
                {categories.map(category => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label={t('posts.form.status')}
            >
              <Select onChange={handleStatusChange}>
                <Select.Option value="draft">{t('posts.status.draft')}</Select.Option>
                <Select.Option value="published">{t('posts.status.published')}</Select.Option>
                <Select.Option value="scheduled">{t('posts.status.scheduled')}</Select.Option>
                <Select.Option value="private">{t('posts.status.private')}</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="publishDate"
              label={t('posts.form.publishDate')}
              rules={[
                { 
                  required: status === 'scheduled',
                  message: t('validation.required') 
                }
              ]}
            >
              <DatePicker 
                showTime 
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="tags"
              label={t('posts.form.tags')}
            >
              <Input placeholder={t('posts.form.tagsPlaceholder')} />
            </Form.Item>

            <Form.Item
              name="featuredImage"
              label={t('posts.form.featuredImage')}
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                name="featuredImage"
                listType="picture-card"
                fileList={fileList}
                beforeUpload={beforeUpload}
                onChange={handleUploadChange}
                customRequest={customRequest}
                maxCount={1}
              >
                {fileList.length >= 1 ? null : (
                  <div>
                    <InboxOutlined />
                    <div style={{ marginTop: 8 }}>{t('posts.form.uploadImage')}</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default PostForm;