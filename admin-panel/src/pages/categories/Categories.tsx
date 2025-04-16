import { EditOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { ConfirmModal } from '@app/components/ConfirmModal';
import categoryService from '@app/services/categories';
import { generateSlug } from '@app/utils/slug';
import { ContentHeader } from '@components';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Switch
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Category } from '../../types/category';
import CategoryTree from './CategoryTree';

const { TextArea } = Input;
const { Option } = Select;

const Categories = () => {
  const { t } = useTranslation();
  
  // State for categories data
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  
  // State for the selected category
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    metaTitle: '',
    metaDescription: '',
    parentId: '',
    featured: false,
    displayOrder: 0
  });
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  
  // For form validation
  const [validated, setValidated] = useState<boolean>(false);

  const [form] = Form.useForm();

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Using the new tree endpoint to get hierarchical data without pagination
      const response = await categoryService.getAllCategoriesTree();
      setCategories(response);
    } catch (error) {
      toast.error(t('categories.errors.loadFailed'));
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : name === 'displayOrder' 
          ? parseInt(value, 10) || 0 
          : value
    });
  };

  // Handle Featured toggle with Ant Design Switch
  const handleFeaturedChange = (checked: boolean) => {
    setFormData({
      ...formData,
      featured: checked
    });
  };

  // Auto-generate slug when name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name
    }));
  };

  // Generate slug when name field is blurred (user finished typing)
  const handleNameBlur = () => {
    const name = form.getFieldValue('name');
    const currentSlug = form.getFieldValue('slug');
    
    // Only auto-generate slug if it's empty or was auto-generated before
    if (!currentSlug || currentSlug === generateSlug(formData.name)) {
      const newSlug = generateSlug(name);
      form.setFieldsValue({ slug: newSlug });
      
      // Also update formData for consistency
      setFormData(prev => ({
        ...prev,
        slug: newSlug
      }));
    }
  };

  // Handle category selection from tree
  const handleCategorySelect = (category: Category) => {
    console.log('Selected category:', category);
    setSelectedCategory(category);
    
    // Extract parentId - could be in either format
    let parentId = '';
    if (category.parentId) {
      parentId = category.parentId;
    } else if (category.parent && category.parent.id) {
      parentId = category.parent.id;
    }
    
    console.log('Extracted parentId:', parentId);
    
    const formValues = {
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || '',
      parentId: parentId,
      featured: category.featured,
      displayOrder: category.displayOrder
    };
    
    setFormData(formValues);
    form.setFieldsValue(formValues);
    setValidated(false);
  };

  // Handle new category button click
  const handleNewCategory = () => {
    setSelectedCategory(null);
    const emptyValues = {
      name: '',
      slug: '',
      description: '',
      metaTitle: '',
      metaDescription: '',
      parentId: '',
      featured: false,
      displayOrder: 0
    };
    
    setFormData(emptyValues);
    form.setFieldsValue(emptyValues);
    setValidated(false);
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      // Format data for API - transforming parentId into a parent object structure
      const categoryData = {
        ...values,
        parent: values.parentId ? { id: values.parentId } : null,
        parentId: undefined // Remove the parentId field as we're using parent object instead
      };
      
      if (selectedCategory) {
        // Update existing category
        await categoryService.updateCategory(selectedCategory.id, categoryData);
        toast.success(t('categories.messages.updateSuccess'));
      } else {
        // Create new category
        await categoryService.createCategory(categoryData);
        toast.success(t('categories.messages.createSuccess'));
      }
      
      // Refresh categories
      fetchCategories();
      
      // Reset form if it was a new category
      if (!selectedCategory) {
        handleNewCategory();
      }
    } catch (error) {
      toast.error(
        selectedCategory 
          ? t('categories.errors.updateFailed') 
          : t('categories.errors.createFailed')
      );
      console.error('Error saving category:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  // Handle category deletion
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    
    setDeleting(true);
    try {
      await categoryService.deleteCategory(categoryToDelete.id);
      toast.success(t('categories.messages.deleteSuccess'));
      
      // Refresh categories
      fetchCategories();
      
      // Reset form if the deleted category was selected
      if (selectedCategory && selectedCategory.id === categoryToDelete.id) {
        handleNewCategory();
      }
    } catch (error) {
      toast.error(t('categories.errors.deleteFailed'));
      console.error('Error deleting category:', error);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };



  return (
    <div>
      <ContentHeader title={t('categories.management')} />
      
      <Row gutter={16} style={{ margin: '24px 8px' }}>
        {/* Tree View - Left 50% */}
        <Col span={12}>
          <Card 
            title={
              <span>
                <EditOutlined style={{ marginRight: 8 }} />
                {t('categories.treeView')}
              </span>
            }
            extra={
              <Button 
                type="primary" 
                size="small"
                onClick={handleNewCategory}
                icon={<PlusOutlined />}
              >
                {t('categories.addNew')}
              </Button>
            }
            style={{ minHeight: '500px' }}
          >
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Spin size="large" />
              </div>
            ) : (
              <CategoryTree 
                categories={categories} 
                onSelectCategory={handleCategorySelect}
                onDeleteCategory={handleDeleteClick}
                selectedCategoryId={selectedCategory?.id}
              />
            )}
          </Card>
        </Col>
        
        {/* Form - Right 50% */}
        <Col span={12}>
          <Card 
            title={
              <span>
                <EditOutlined style={{ marginRight: 8 }} />
                {selectedCategory 
                  ? t('categories.editCategory') 
                  : t('categories.addCategory')}
              </span>
            }
            style={{ minHeight: '500px' }}
          >
            <div style={{ position: 'relative', minHeight: '400px' }}>
              {saving && (
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%', 
                  background: 'rgba(255, 255, 255, 0.7)', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  zIndex: 1 
                }}>
                  <Spin size="large" />
                </div>
              )}
              
              <Form 
                form={form}
                layout="vertical" 
                onFinish={handleSubmit}
                initialValues={formData}
              >
                <Form.Item
                  label={t('categories.form.name')}
                  name="name"
                  rules={[{ required: true, message: t('validation.required') }]}
                >
                  <Input
                    placeholder={t('categories.form.namePlaceholder')}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                  />
                </Form.Item>
                
                <Form.Item
                  label={t('categories.form.slug')}
                  name="slug"
                  rules={[{ required: true, message: t('validation.required') }]}
                >
                  <Input
                    placeholder={t('categories.form.slugPlaceholder')}
                    onChange={(e) => handleChange(e)}
                  />
                </Form.Item>
                
                <Form.Item
                  label={t('categories.form.description')}
                  name="description"
                >
                  <TextArea
                    rows={3}
                    placeholder={t('categories.form.descriptionPlaceholder')}
                    onChange={(e) => handleChange(e)}
                  />
                </Form.Item>
                
                <Form.Item
                  label={t('categories.form.parentCategory')}
                  name="parentId"
                >
                  <Select
                    placeholder={t('categories.form.noParent')}
                    allowClear
                    value={formData.parentId || undefined}
                    onChange={(value) => {
                      console.log('Changing parent category to:', value);
                      setFormData({...formData, parentId: value});
                    }}
                  >
                    <Option value="">{t('categories.form.noParent')}</Option>
                    {(categories || [])
                      .filter(cat => !selectedCategory || cat.id !== selectedCategory.id)
                      .map(category => (
                        <Option key={category.id} value={category.id}>
                          {category.name}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={t('categories.form.displayOrder')}
                      name="displayOrder"
                    >
                      <Input
                        type="number"
                        min={0}
                        onChange={(e) => handleChange(e)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={t('categories.form.featured')}
                      name="featured"
                      valuePropName="checked"
                    >
                      <Switch
                        onChange={handleFeaturedChange}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <div style={{ marginTop: 24 }}>
                  <h5>{t('categories.form.seoSection')}</h5>
                  <hr />
                </div>
                
                <Form.Item
                  label={t('categories.form.metaTitle')}
                  name="metaTitle"
                >
                  <Input
                    placeholder={t('categories.form.metaTitlePlaceholder')}
                    onChange={(e) => handleChange(e)}
                  />
                </Form.Item>
                
                <Form.Item
                  label={t('categories.form.metaDescription')}
                  name="metaDescription"
                >
                  <TextArea
                    rows={2}
                    placeholder={t('categories.form.metaDescriptionPlaceholder')}
                    onChange={(e) => handleChange(e)}
                  />
                </Form.Item>
                
                <Form.Item>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="default"
                      onClick={handleNewCategory}
                      style={{ marginRight: 8 }}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={saving}
                      icon={!saving && <SaveOutlined />}
                    >
                      {saving ? t('common.saving') : t('common.save')}
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        title={t('categories.deleteTitle')}
        message={
          <>
            {t('categories.delete.confirmation')}
            <strong> {categoryToDelete?.name}</strong>?
            {categoryToDelete?.children && categoryToDelete.children.length > 0 && (
              <Alert
                type="warning"
                message={t('categories.delete.warningChildren')}
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </>
        }
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={handleDeleteConfirm}
        confirmVariant="danger"
      />
    </div>
  );
};

export default Categories;