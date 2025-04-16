import ContentHeader from '@app/components/content-header/ContentHeader';
import { OverlayLoading } from '@app/components/OverlayLoading';
import apiService from '@app/services/api';
import { CATEGORY_ENDPOINTS } from '@app/services/apiEndpoints';
import { createCategory, updateCategory } from '@app/store/reducers/category';
import { generateSlug } from '@app/utils/slug';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card, Checkbox, Col, Form, Input, InputNumber, Row, Select } from 'antd';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  displayOrder?: number;
  children?: Category[];
}


const CategoryForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialValues, setInitialValues] = useState<{
    name: string;
    slug: string;
    description: string;
    parentId: string;
    featured: boolean;
    metaTitle: string;
    metaDescription: string;
    displayOrder: number;
  }>({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    featured: false,
    metaTitle: '',
    metaDescription: '',
    displayOrder: 0,
  });
  
  const dispatch = useDispatch();

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required(t('categories.validation.nameRequired')),
    slug: Yup.string()
      .matches(/^[a-z0-9-]*$/, t('categories.validation.slugFormat'))
      .notRequired(),
    description: Yup.string().notRequired(),
    parentId: Yup.string().notRequired(),
    featured: Yup.boolean().notRequired(),
    metaTitle: Yup.string().notRequired(),
    metaDescription: Yup.string().notRequired(),
    displayOrder: Yup.number().integer().min(0).notRequired(),
  });
  
  useEffect(() => {
    // This effect will run whenever initialValues.parentId changes
    // to help debug the parent category selection issue
    console.log('Current parentId in initialValues:', initialValues.parentId);
  }, [initialValues.parentId]);
  
  // Fetch all categories (for parent category dropdown)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Use the tree endpoint to get hierarchical data
        const response = await apiService.get(CATEGORY_ENDPOINTS.GET_ALL_TREE);
        
        // Extract categories from the response
        const fetchedCategories = response.categories || [];
        
        // Flatten the categories while preserving their original data for rendering in groups
        const flattenedCategories = fetchedCategories.map(category => ({
          ...category,
          // Make sure children exist for consistency
          children: category.children || []
        }));
        
        console.log('Categories loaded for dropdown with hierarchy:', flattenedCategories);
        setCategories(flattenedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error(t('categories.errors.fetchFailed'));
      }
    };
    
    fetchCategories();
  }, [t]);

  // Fetch category data if in edit mode
  useEffect(() => {
    const fetchCategory = async () => {
      if (isEditMode && id) {
        try {
          setLoading(true);
          console.log(`Fetching category with ID: ${id}`);
          const response = await apiService.get(CATEGORY_ENDPOINTS.GET_BY_ID(id));
          console.log('Category data received:', response);
          
          if (!response || typeof response !== 'object') {
            console.error('Invalid category data received:', response);
            toast.error(t('categories.errors.invalidData'));
            navigate('/categories');
            return;
          }
          
          // Extract parentId with a more robust approach
          let parentId = '';
          if (response.parentId) {
            // If parentId is directly in the response
            parentId = response.parentId;
          } else if (response.parent && response.parent.id) {
            // If parent is an object with an id
            parentId = response.parent.id;
          }
          
          console.log('Parent ID extracted:', parentId);
          
          const newValues = {
            name: response.name || '',
            slug: response.slug || '',
            description: response.description || '',
            parentId: parentId, // Use the extracted parentId
            featured: Boolean(response.featured), // Convert to boolean explicitly
            metaTitle: response.metaTitle || '',
            metaDescription: response.metaDescription || '',
            displayOrder: response.displayOrder || 0,
          };
          
          console.log('Setting form with values:', newValues);
          setInitialValues(newValues);
        } catch (error) {
          console.error('Error fetching category:', error);
          toast.error(t('categories.errors.fetchFailed'));
          navigate('/categories');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchCategory();
  }, [isEditMode, id, navigate, t]);

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // Generate slug if empty
      if (!values.slug && values.name) {
        values.slug = generateSlug(values.name);
      }
      
      // Format data for API - transforming parentId into a parent object structure
      const categoryData = {
        ...values,
        parent: values.parentId ? { id: values.parentId } : null,
        parentId: undefined // Remove the parentId field as we're using parent object instead
      };
      
      if (isEditMode && id) {
        // Update existing category
        await apiService.put(CATEGORY_ENDPOINTS.UPDATE(id), categoryData);
        dispatch(updateCategory({...values, id}));
        toast.success(t('categories.messages.updateSuccess'));
      } else {
        // Create new category
        await apiService.post(CATEGORY_ENDPOINTS.CREATE, categoryData);
        dispatch(createCategory(values));
        toast.success(t('categories.messages.createSuccess'));
      }
      
      navigate('/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(isEditMode ? t('categories.errors.updateFailed') : t('categories.errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader
        title={isEditMode 
          ? t('categories.editTitle', { name: initialValues.name }) 
          : t('categories.createTitle')}
      />
      
      <section className="content">
        <div className="container-fluid">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({
              handleSubmit,
              handleChange,
              handleBlur,
              values,
              touched,
              errors,
              isValid,
              dirty,
              setFieldValue,
            }) => (
              <Form layout="vertical" onFinish={handleSubmit}>
                <Card>
                  <Card.Meta
                    title={isEditMode 
                      ? t('categories.editTitle', { name: initialValues.name }) 
                      : t('categories.createTitle')}
                  />
                  
                  <div className="position-relative mt-4">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label={t('categories.form.name')}
                          validateStatus={touched.name && errors.name ? 'error' : ''}
                          help={touched.name && errors.name}
                        >
                          <Input
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t('categories.form.namePlaceholder')}
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col span={12}>
                        <Form.Item
                          label={t('categories.form.slug')}
                          validateStatus={touched.slug && errors.slug ? 'error' : ''}
                          help={touched.slug && errors.slug}
                        >
                          <Input
                            name="slug"
                            value={values.slug}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t('categories.form.slugPlaceholder')}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          label={t('categories.form.description')}
                          validateStatus={touched.description && errors.description ? 'error' : ''}
                          help={touched.description && errors.description}
                        >
                          <Input.TextArea
                            name="description"
                            rows={3}
                            value={values.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t('categories.form.descriptionPlaceholder')}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label={t('categories.form.parentCategory')}
                          validateStatus={touched.parentId && errors.parentId ? 'error' : ''}
                          help={touched.parentId && errors.parentId}
                        >
                          <Select
                            name="parentId"
                            value={values.parentId || undefined}
                            onChange={(value) => {
                              console.log('Selecting parent category:', value);
                              setFieldValue('parentId', value);
                            }}
                            onBlur={() => handleBlur({ target: { name: 'parentId' } })}
                            placeholder={t('categories.form.noParent')}
                            allowClear
                          >
                            <Select.Option value="">{t('categories.form.noParent')}</Select.Option>
                            
                            {/* Recursive function to render categories hierarchically */}
                            {(function renderCategoryOptions(categoryList, currentId) {
                              return categoryList
                                .filter(cat => cat.id !== currentId) // Prevent selecting self as parent
                                .map(category => {
                                  // If category has children and is not the current category being edited
                                  if (category.children && category.children.length > 0) {
                                    return (
                                      <Select.OptGroup key={category.id} label={category.name}>
                                        {/* Add the parent category itself as an option */}
                                        <Select.Option key={category.id} value={category.id}>
                                          {category.name}
                                        </Select.Option>
                                        {/* Add all child categories */}
                                        {renderCategoryOptions(category.children, currentId)}
                                      </Select.OptGroup>
                                    );
                                  }
                                  
                                  // If no children or is not the category being edited
                                  return (
                                    <Select.Option key={category.id} value={category.id}>
                                      {category.name}
                                    </Select.Option>
                                  );
                                });
                            })(categories, id)}
                          </Select>
                        </Form.Item>
                      </Col>
                      
                      <Col span={6}>
                        <Form.Item
                          label={t('categories.form.displayOrder') || 'Display Order'}
                          validateStatus={touched.displayOrder && errors.displayOrder ? 'error' : ''}
                          help={touched.displayOrder && errors.displayOrder}
                        >
                          <InputNumber
                            name="displayOrder"
                            value={values.displayOrder}
                            onChange={(value) => setFieldValue('displayOrder', value)}
                            onBlur={() => handleBlur({ target: { name: 'displayOrder' } })}
                            min={0}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col span={6}>
                        <Form.Item
                          label=" "
                          className="mt-2"
                        >
                          <Checkbox
                            name="featured"
                            checked={values.featured}
                            onChange={(e) => setFieldValue('featured', e.target.checked)}
                          >
                            {t('categories.form.featured')}
                          </Checkbox>
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <hr />
                    <h5>{t('categories.form.seoSection')}</h5>
                    
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label={t('categories.form.metaTitle')}
                          validateStatus={touched.metaTitle && errors.metaTitle ? 'error' : ''}
                          help={touched.metaTitle && errors.metaTitle}
                        >
                          <Input
                            name="metaTitle"
                            value={values.metaTitle}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t('categories.form.metaTitlePlaceholder')}
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col span={12}>
                        <Form.Item
                          label={t('categories.form.metaDescription')}
                          validateStatus={touched.metaDescription && errors.metaDescription ? 'error' : ''}
                          help={touched.metaDescription && errors.metaDescription}
                        >
                          <Input.TextArea
                            name="metaDescription"
                            rows={2}
                            value={values.metaDescription}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder={t('categories.form.metaDescriptionPlaceholder')}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    {loading && <OverlayLoading />}
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <Button
                      type="default"
                      onClick={() => navigate('/categories')}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      disabled={loading || !(isValid && (dirty || isEditMode))}
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-1" />
                      {t('common.save')}
                    </Button>
                  </div>
                </Card>
              </Form>
            )}
          </Formik>
        </div>
      </section>
    </>
  );
};

export default CategoryForm;