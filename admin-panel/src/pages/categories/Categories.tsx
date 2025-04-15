import { ConfirmModal } from '@app/components/ConfirmModal';
import { OverlayLoading } from '@app/components/OverlayLoading';
import categoryService from '@app/services/categories';
import { ContentHeader } from '@components';
import { faEdit, faPlus, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Switch } from 'antd';
import { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Category } from '../../types/category';
import CategoryTree from './CategoryTree';

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
      
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {/* Tree View - Left 50% */}
            <div className="col-md-6">
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <FontAwesomeIcon icon={faEdit} className="mr-2" />
                    {t('categories.treeView')}
                  </h3>
                  <div className="card-tools">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={handleNewCategory}
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-1" />
                      {t('categories.addNew')}
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body style={{ minHeight: '500px' }}>
                  {loading ? (
                    <OverlayLoading />
                  ) : (
                    <CategoryTree 
                      categories={categories} 
                      onSelectCategory={handleCategorySelect}
                      onDeleteCategory={handleDeleteClick}
                      selectedCategoryId={selectedCategory?.id}
                    />
                  )}
                </Card.Body>
              </Card>
            </div>
            
            {/* Form - Right 50% */}
            <div className="col-md-6">
              <Card>
                <Card.Header>
                  <h3 className="card-title">
                    <FontAwesomeIcon icon={faEdit} className="mr-2" />
                    {selectedCategory 
                      ? t('categories.editCategory') 
                      : t('categories.addCategory')}
                  </h3>
                </Card.Header>
                <Form 
                  noValidate 
                  validated={validated} 
                  onSubmit={handleSubmit}
                >
                  <Card.Body style={{ minHeight: '500px' }}>
                    {saving && <OverlayLoading />}
                    
                    <Form.Group className="mb-3">
                      <Form.Label>{t('categories.form.name')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleNameChange}
                        placeholder={t('categories.form.namePlaceholder')}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {t('validation.required')}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>{t('categories.form.slug')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        placeholder={t('categories.form.slugPlaceholder')}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {t('validation.required')}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>{t('categories.form.description')}</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder={t('categories.form.descriptionPlaceholder')}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>{t('categories.form.parentCategory')}</Form.Label>
                      <Form.Control
                        as="select"
                        name="parentId"
                        value={formData.parentId}
                        onChange={handleChange}
                      >
                        <option value="">{t('categories.form.noParent')}</option>
                        {(categories || [])
                          .filter(cat => !selectedCategory || cat.id !== selectedCategory.id)
                          .map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                      </Form.Control>
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('categories.form.displayOrder')}</Form.Label>
                          <Form.Control
                            type="number"
                            name="displayOrder"
                            value={formData.displayOrder}
                            onChange={handleChange}
                            min={0}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3 mt-4">
                          <div className="d-flex align-items-center">
                            <label className="mr-2">{t('categories.form.featured')}</label>
                            <Switch
                              checked={formData.featured}
                              onChange={handleFeaturedChange}
                              size="small"
                              className="ml-2"
                            />
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <h5 className="mt-4">{t('categories.form.seoSection')}</h5>
                    <hr />
                    
                    <Form.Group className="mb-3">
                      <Form.Label>{t('categories.form.metaTitle')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleChange}
                        placeholder={t('categories.form.metaTitlePlaceholder')}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>{t('categories.form.metaDescription')}</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleChange}
                        placeholder={t('categories.form.metaDescriptionPlaceholder')}
                      />
                    </Form.Group>
                  </Card.Body>
                  
                  <Card.Footer>
                    <div className="d-flex justify-content-end">
                      <Button
                        variant="secondary"
                        className="mr-2"
                        onClick={handleNewCategory}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                            {t('common.saving')}
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faSave} className="mr-1" />
                            {t('common.save')}
                          </>
                        )}
                      </Button>
                    </div>
                  </Card.Footer>
                </Form>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title={t('categories.deleteTitle')}
        message={
          <>
            {t('categories.delete.confirmation')}
            <strong> {categoryToDelete?.name}</strong>?
            {categoryToDelete?.children && categoryToDelete.children.length > 0 && (
              <div className="alert alert-warning mt-3">
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                {t('categories.delete.warningChildren')}
              </div>
            )}
          </>
        }
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={handleDeleteConfirm}
        confirmVariant="danger"
        isProcessing={deleting}
      />
    </div>
  );
};

export default Categories;