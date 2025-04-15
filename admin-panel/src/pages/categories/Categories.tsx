import { EditOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { ConfirmModal } from '@app/components/ConfirmModal';
import categoryService from '@app/services/categories';
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

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Auto-generate slug when name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      // Only auto-generate if slug field is empty or was auto-generated before
      ...(formData.slug === '' || formData.slug === generateSlug(formData.name) 
          ? { slug: generateSlug(name) } 
          : {})
    });
  };

  // Handle category selection from tree
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || '',
      parentId: category.parent ? category.parent.id : '',
      featured: category.featured,
      displayOrder: category.displayOrder
    });
    setValidated(false);
  };

  // Handle new category button click
  const handleNewCategory = () => {
    setSelectedCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      metaTitle: '',
      metaDescription: '',
      parentId: '',
      featured: false,
      displayOrder: 0
    });
    setValidated(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setSaving(true);
    try {
      const categoryData = {
        ...formData,
        parentId: formData.parentId || null
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
              
              <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                  label={t('categories.form.name')}
                  name="name"
                  initialValue={formData.name}
                  rules={[{ required: true, message: t('validation.required') }]}
                >
                  <Input
                    placeholder={t('categories.form.namePlaceholder')}
                    value={formData.name}
                    onChange={handleNameChange}
                  />
                </Form.Item>
                
                <Form.Item
                  label={t('categories.form.slug')}
                  name="slug"
                  initialValue={formData.slug}
                  rules={[{ required: true, message: t('validation.required') }]}
                >
                  <Input
                    placeholder={t('categories.form.slugPlaceholder')}
                    value={formData.slug}
                    onChange={(e) => handleChange(e)}
                  />
                </Form.Item>
                
                <Form.Item
                  label={t('categories.form.description')}
                  name="description"
                  initialValue={formData.description}
                >
                  <TextArea
                    rows={3}
                    placeholder={t('categories.form.descriptionPlaceholder')}
                    value={formData.description}
                    onChange={(e) => handleChange(e)}
                  />
                </Form.Item>
                
                <Form.Item
                  label={t('categories.form.parentCategory')}
                  name="parentId"
                  initialValue={formData.parentId}
                >
                  <Select
                    placeholder={t('categories.form.noParent')}
                    allowClear
                    value={formData.parentId}
                    onChange={(value) => setFormData({...formData, parentId: value})}
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
                      initialValue={formData.displayOrder}
                    >
                      <Input
                        type="number"
                        min={0}
                        value={formData.displayOrder}
                        onChange={(e) => handleChange(e)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={t('categories.form.featured')}
                      name="featured"
                      valuePropName="checked"
                      initialValue={formData.featured}
                    >
                      <Switch
                        checked={formData.featured}
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
                  initialValue={formData.metaTitle}
                >
                  <Input
                    placeholder={t('categories.form.metaTitlePlaceholder')}
                    value={formData.metaTitle}
                    onChange={(e) => handleChange(e)}
                  />
                </Form.Item>
                
                <Form.Item
                  label={t('categories.form.metaDescription')}
                  name="metaDescription"
                  initialValue={formData.metaDescription}
                >
                  <TextArea
                    rows={2}
                    placeholder={t('categories.form.metaDescriptionPlaceholder')}
                    value={formData.metaDescription}
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