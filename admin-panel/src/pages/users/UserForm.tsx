import ContentHeader from '@app/components/content-header/ContentHeader';
import { OverlayLoading } from '@app/components/OverlayLoading';
import { getAllRoles } from '@app/services/roles';
import userService from '@app/services/users';
import { Role, UserCreateRequest, UserUpdateRequest } from '@app/types/user';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik } from 'formik';
import debounce from 'lodash/debounce';
import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

interface SelectOption {
  value: string;
  label: string;
}

const UserForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState<boolean>(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleOptions, setRoleOptions] = useState<SelectOption[]>([]);
  const [fetchingRoles, setFetchingRoles] = useState<boolean>(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState<boolean>(false);
  const [checkingEmail, setCheckingEmail] = useState<boolean>(false);
  const [initialValues, setInitialValues] = useState<{
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    roleIds: string[];
    superAdmin: boolean;
  }>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    roleIds: [],
    superAdmin: false,
  });
  
  // Validation schema
  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .min(3, t('validation.usernameMinLength'))
      .max(50, t('validation.usernameMaxLength'))
      .required(t('validation.required')),
    email: Yup.string()
      .email(t('validation.invalidEmail'))
      .required(t('validation.required')),
    password: isEditMode
      ? Yup.string().optional()
      : Yup.string()
          .min(6, t('validation.passwordMinLength'))
          .required(t('validation.required')),
    confirmPassword: isEditMode
      ? Yup.string().test('passwords-match', t('validation.passwordsMustMatch'), function (value) {
          return !this.parent.password || value === this.parent.password;
        })
      : Yup.string()
          .oneOf([Yup.ref('password')], t('validation.passwordsMustMatch'))
          .required(t('validation.required')),
    fullName: Yup.string()
      .max(100, t('validation.fullNameMaxLength'))
      .required(t('validation.required')),
    roleIds: Yup.array()
      .min(1, t('validation.atLeastOneRole'))
      .required(t('validation.required')),
  });
  
  // Debounced function to check username availability
  const checkUsernameAvailability = useCallback(
    debounce(async (username: string, formikSetFieldError: any) => {
      if (username.length < 3) return; // Don't check until minimum length
      
      try {
        setCheckingUsername(true);
        const result = await userService.checkAvailability({
          username,
          excludeUserId: isEditMode ? id : undefined
        });
        
        if (result.usernameAvailable === false) {
          setUsernameError(t('users.errors.usernameExists'));
          formikSetFieldError('username', t('users.errors.usernameExists'));
        } else {
          setUsernameError(null);
        }
      } catch (error) {
        console.error('Error checking username availability:', error);
      } finally {
        setCheckingUsername(false);
      }
    }, 500), // 500ms debounce
    [t, id, isEditMode]
  );
  
  // Debounced function to check email availability
  const checkEmailAvailability = useCallback(
    debounce(async (email: string, formikSetFieldError: any) => {
      if (!email || !email.includes('@')) return; // Basic email validation
      
      try {
        setCheckingEmail(true);
        const result = await userService.checkAvailability({
          email,
          excludeUserId: isEditMode ? id : undefined
        });
        
        if (result.emailAvailable === false) {
          setEmailError(t('users.errors.emailExists'));
          formikSetFieldError('email', t('users.errors.emailExists'));
        } else {
          setEmailError(null);
        }
      } catch (error) {
        console.error('Error checking email availability:', error);
      } finally {
        setCheckingEmail(false);
      }
    }, 500), // 500ms debounce
    [t, id, isEditMode]
  );
  
  // Fetch available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setFetchingRoles(true);
        const response = await getAllRoles({ size: 100 }); // Get up to 100 roles
        setRoles(response.roles);
        
        // Create options for react-select
        const options = response.roles.map(role => ({
          value: role.id,
          label: role.name
        }));
        setRoleOptions(options);
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error(t('roles.errors.fetchFailed'));
      } finally {
        setFetchingRoles(false);
      }
    };
    
    fetchRoles();
  }, [t]);

  // Fetch user data if in edit mode
  useEffect(() => {
    const fetchUser = async () => {
      if (isEditMode && id) {
        try {
          setLoading(true);
          const user = await userService.getUserById(id);
          // Extract role IDs from user roles
          const userRoleIds = user.roles && Array.isArray(user.roles) 
            ? user.roles.map((role: any) => role.id || '') 
            : [];
          
          setInitialValues({
            username: user.username || '',
            email: user.email || '',
            password: '',
            confirmPassword: '',
            fullName: user.fullName || user.name || '',
            roleIds: userRoleIds,
            superAdmin: user.superAdmin || false,
          });
        } catch (error) {
          console.error('Error fetching user:', error);
          toast.error(t('users.errors.fetchFailed'));
          navigate('/users');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchUser();
  }, [isEditMode, id, navigate, t]);
  
  // Handle form submission
  const handleSubmit = async (values: any) => {
    // First, do a final check for username and email availability
    try {
      setLoading(true);
      
      // Check for username and email conflicts before submitting
      if (!isEditMode) {
        const result = await userService.checkAvailability({
          username: values.username,
          email: values.email
        });
        
        if (result.usernameAvailable === false) {
          toast.error(t('users.errors.usernameExists'));
          setLoading(false);
          return;
        }
        
        if (result.emailAvailable === false) {
          toast.error(t('users.errors.emailExists'));
          setLoading(false);
          return;
        }
      }
      
      if (isEditMode && id) {
        // Update existing user
        const updateData: UserUpdateRequest = {
          username: values.username,
          email: values.email,
          fullName: values.fullName,
          roleIds: values.roleIds,
          superAdmin: values.superAdmin,
        };
        
        await userService.updateUser(id, updateData);
        toast.success(t('users.messages.updateSuccess'));
        navigate('/users');
      } else {
        // Create new user
        const createData: UserCreateRequest = {
          username: values.username,
          email: values.email,
          password: values.password,
          fullName: values.fullName,
          roleIds: values.roleIds,
          superAdmin: values.superAdmin,
        };
        
        try {
          await userService.createUser(createData);
          toast.success(t('users.messages.createSuccess'));
          navigate('/users');
        } catch (error: any) {
          // Handle conflict errors (409) specifically for username or email
          if (error.response && error.response.status === 409) {
            const errorData = error.response.data;
            if (errorData && errorData.message) {
              if (errorData.message.includes('Username')) {
                toast.error(t('users.errors.usernameExists'));
              } else if (errorData.message.includes('Email')) {
                toast.error(t('users.errors.emailExists'));
              } else {
                toast.error(errorData.message);
              }
            } else {
              toast.error(t('users.errors.createFailed'));
            }
          } else {
            throw error; // Re-throw for the outer catch block
          }
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(isEditMode ? t('users.errors.updateFailed') : t('users.errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <ContentHeader
        title={isEditMode ? t('users.editTitle') : t('users.createTitle')}
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
              setFieldError,
            }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <Card>
                  <Card.Header>
                    <h3 className="card-title">
                      {isEditMode ? t('users.editDetails') : t('users.createDetails')}
                    </h3>
                  </Card.Header>
                  
                  <Card.Body>
                    <div className="position-relative">
                      <Row>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label htmlFor="username">
                              {t('users.fields.username')} <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                              id="username"
                              name="username"
                              value={values.username}
                              onChange={(e) => {
                                handleChange(e);
                                setUsernameError(null); // Clear previous error
                                if (e.target.value.length >= 3) {
                                  checkUsernameAvailability(e.target.value, setFieldError);
                                }
                              }}
                              onBlur={handleBlur}
                              isInvalid={(touched.username && !!errors.username) || !!usernameError}
                            />
                            {checkingUsername && (
                              <div className="text-info small mt-1">
                                <i className="fas fa-spinner fa-spin mr-1"></i>
                                {t('users.checkingUsername')}
                              </div>
                            )}
                            <Form.Control.Feedback type="invalid">
                              {usernameError || errors.username}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label htmlFor="email">
                              {t('users.fields.email')} <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                              id="email"
                              name="email"
                              type="email"
                              value={values.email}
                              onChange={(e) => {
                                handleChange(e);
                                setEmailError(null); // Clear previous error
                                if (e.target.value.includes('@')) {
                                  checkEmailAvailability(e.target.value, setFieldError);
                                }
                              }}
                              onBlur={handleBlur}
                              isInvalid={(touched.email && !!errors.email) || !!emailError}
                            />
                            {checkingEmail && (
                              <div className="text-info small mt-1">
                                <i className="fas fa-spinner fa-spin mr-1"></i>
                                {t('users.checkingEmail')}
                              </div>
                            )}
                            <Form.Control.Feedback type="invalid">
                              {emailError || errors.email}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label htmlFor="fullName">
                              {t('users.fields.fullName')} <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                              id="fullName"
                              name="fullName"
                              value={values.fullName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.fullName && !!errors.fullName}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.fullName}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label htmlFor="roleIds">
                              {t('users.fields.roles')} <span className="text-danger">*</span>
                            </Form.Label>
                            <Select
                              id="roleIds"
                              name="roleIds"
                              isMulti
                              options={roleOptions}
                              className={touched.roleIds && !!errors.roleIds ? 'is-invalid' : ''}
                              placeholder={t('users.selectRoles')}
                              isLoading={fetchingRoles}
                              isDisabled={fetchingRoles}
                              value={roleOptions.filter(option => 
                                values.roleIds.includes(option.value)
                              )}
                              onChange={(selectedOptions) => {
                                const selectedRoleIds = selectedOptions 
                                  ? selectedOptions.map(option => option.value) 
                                  : [];
                                setFieldValue('roleIds', selectedRoleIds);
                              }}
                              onBlur={() => setFieldValue('touched.roleIds', true)}
                            />
                            <Form.Text className="text-muted">
                              {t('users.roleSelectionHint')}
                            </Form.Text>
                            {touched.roleIds && !!errors.roleIds && (
                              <div className="invalid-feedback d-block">
                                {errors.roleIds}
                              </div>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label htmlFor="superAdmin">
                              {t('users.fields.superAdmin')}
                            </Form.Label>
                            <Form.Check
                              id="superAdmin"
                              name="superAdmin"
                              type="switch"
                              checked={values.superAdmin}
                              onChange={(e) => setFieldValue('superAdmin', e.target.checked)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      {!isEditMode && (
                        <Row>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label htmlFor="password">
                                {t('users.fields.password')} <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Control
                                id="password"
                                name="password"
                                type="password"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched.password && !!errors.password}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.password}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label htmlFor="confirmPassword">
                                {t('users.fields.confirmPassword')}{' '}
                                <span className="text-danger">*</span>
                              </Form.Label>
                              <Form.Control
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={values.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={
                                  touched.confirmPassword && !!errors.confirmPassword
                                }
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.confirmPassword}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>
                      )}
                      
                      {loading && <OverlayLoading />}
                    </div>
                  </Card.Body>
                  
                  <Card.Footer>
                    <div className="d-flex justify-content-between">
                      <Button
                        variant="secondary"
                        onClick={() => navigate('/users')}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={
                          !(isValid && (dirty || isEditMode)) || 
                          loading || 
                          checkingUsername || 
                          checkingEmail || 
                          !!usernameError || 
                          !!emailError
                        }
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

export default UserForm;