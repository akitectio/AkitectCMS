import ContentHeader from '@app/components/content-header/ContentHeader';
import { OverlayLoading } from '@app/components/OverlayLoading';
import apiService from '@app/services/api';
import { CATEGORY_ENDPOINTS } from '@app/services/apiEndpoints';
import { createCategory, updateCategory } from '@app/store/reducers/category';
import { generateSlug } from '@app/utils/slug';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
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
  }>({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    featured: false,
    metaTitle: '',
    metaDescription: '',
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
  });
  

  // Fetch all categories (for parent category dropdown)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.get(CATEGORY_ENDPOINTS.GET_ALL);
        const fetchedCategories = Array.isArray(response.content)
          ? response.content
          : Array.isArray(response)
          ? response
          : [];
        setCategories(fetchedCategories);
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
          const category = await apiService.get(CATEGORY_ENDPOINTS.GET_BY_ID(id));
          
          setInitialValues({
            name: category.name || '',
            slug: category.slug || '',
            description: category.description || '',
            parentId: category.parentId || '',
            featured: category.featured || false,
            metaTitle: category.metaTitle || '',
            metaDescription: category.metaDescription || '',
          });
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
      
      if (isEditMode && id) {
        // Update existing category
        await apiService.put(CATEGORY_ENDPOINTS.UPDATE(id), values);
        dispatch(updateCategory(values));
        toast.success(t('categories.messages.updateSuccess'));
      } else {
        // Create new category
        await apiService.post(CATEGORY_ENDPOINTS.CREATE, values);
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
              <Form noValidate onSubmit={handleSubmit}>
                <Card>
                  <Card.Header>
                    <h3 className="card-title">
                      {isEditMode 
                        ? t('categories.editTitle', { name: initialValues.name }) 
                        : t('categories.createTitle')}
                    </h3>
                  </Card.Header>
                  
                  <Card.Body>
                    <div className="position-relative">
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label htmlFor="name">
                              {t('categories.form.name')} <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                              id="name"
                              name="name"
                              value={values.name}
                              onChange={(e) => {
                                handleChange(e);
                                // Auto-generate slug if slug is empty or hasn't been manually edited
                                if (!values.slug || values.slug === generateSlug(values.name)) {
                                  setFieldValue('slug', generateSlug(e.target.value));
                                }
                              }}
                              onBlur={handleBlur}
                              isInvalid={touched.name && !!errors.name}
                              placeholder={t('categories.form.namePlaceholder')}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.name}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label htmlFor="slug">
                              {t('categories.form.slug')}
                            </Form.Label>
                            <Form.Control
                              id="slug"
                              name="slug"
                              value={values.slug}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.slug && !!errors.slug}
                              placeholder={t('categories.form.slugPlaceholder')}
                            />
                            <Form.Text className="text-muted">
                              {t('categories.form.slugPlaceholder')}
                            </Form.Text>
                            <Form.Control.Feedback type="invalid">
                              {errors.slug}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label htmlFor="description">
                              {t('categories.form.description')}
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              id="description"
                              name="description"
                              value={values.description}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.description && !!errors.description}
                              placeholder={t('categories.form.descriptionPlaceholder')}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.description}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label htmlFor="parentId">
                              {t('categories.form.parentCategory')}
                            </Form.Label>
                            <Form.Control
                              as="select"
                              id="parentId"
                              name="parentId"
                              value={values.parentId}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.parentId && !!errors.parentId}
                            >
                              <option value="">{t('categories.form.noParent')}</option>
                              {categories.filter(cat => cat.id !== id) // Exclude current category to prevent circular reference
                                .map(category => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </Form.Control>
                            <Form.Text className="text-muted">
                              {t('categories.form.selectParentCategory')}
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Check
                              type="checkbox"
                              id="featured"
                              label={t('categories.form.featured')}
                              checked={values.featured}
                              onChange={(e) => setFieldValue('featured', e.target.checked)}
                              className="mt-4"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <hr />
                      <h5>{t('categories.form.seoSection')}</h5>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label htmlFor="metaTitle">
                              {t('categories.form.metaTitle')}
                            </Form.Label>
                            <Form.Control
                              id="metaTitle"
                              name="metaTitle"
                              value={values.metaTitle}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.metaTitle && !!errors.metaTitle}
                              placeholder={t('categories.form.metaTitlePlaceholder')}
                            />
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label htmlFor="metaDescription">
                              {t('categories.form.metaDescription')}
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              id="metaDescription"
                              name="metaDescription"
                              value={values.metaDescription}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.metaDescription && !!errors.metaDescription}
                              placeholder={t('categories.form.metaDescriptionPlaceholder')}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      {loading && <OverlayLoading />}
                    </div>
                  </Card.Body>
                  
                  <Card.Footer>
                    <div className="d-flex justify-content-between">
                      <Button
                        variant="secondary"
                        onClick={() => navigate('/categories')}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={loading || !(isValid && (dirty || isEditMode))}
                      >
                        <FontAwesomeIcon icon={faSave} className="mr-1" />
                        {t('common.save')}
                      </Button>
                    </div>
                  </Card.Footer>
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