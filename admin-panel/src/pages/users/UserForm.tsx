import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import ContentHeader from '@app/components/content-header/ContentHeader';
import { getAllRoles } from '@app/services/roles';
import userService from '@app/services/users';
import { Role, UserCreateRequest, UserUpdateRequest } from '@app/types/user';
import {
    Button,
    Card,
    Checkbox,
    Col,
    Form,
    Input,
    Row,
    Select,
    Spin,
    Typography
} from 'antd';
import debounce from 'lodash/debounce';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

const { Text } = Typography;
const { Option } = Select;

interface SelectOption {
  value: string;
  label: string;
}

const UserForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleOptions, setRoleOptions] = useState<SelectOption[]>([]);
  const [fetchingRoles, setFetchingRoles] = useState<boolean>(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState<boolean>(false);
  const [checkingEmail, setCheckingEmail] = useState<boolean>(false);
  const [userDataLoaded, setUserDataLoaded] = useState<boolean>(false);
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
      .when('superAdmin', {
        is: false,
        then: Yup.array()
          .min(1, t('validation.atLeastOneRole'))
          .required(t('validation.required')),
        otherwise: Yup.array()
      })
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
          
          // Use the roleIds array directly from the API response
          // The API returns roleIds directly, no need to extract from roles array
          const userRoleIds = user.roleIds || [];
          
          console.log('Fetched user:', user);
          console.log('Extracted roleIds:', userRoleIds);
          
          setInitialValues({
            username: user.username || '',
            email: user.email || '',
            password: '',
            confirmPassword: '',
            fullName: user.fullName || user.name || '',
            roleIds: userRoleIds,
            superAdmin: user.superAdmin || false,
          });
          
          // Set form values after fetching
          form.setFieldsValue({
            username: user.username || '',
            email: user.email || '',
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
  }, [isEditMode, id, navigate, t, form]);
  
  // Use effect to debug role values and selected options
  useEffect(() => {
    if (isEditMode && initialValues.roleIds.length > 0) {
      console.log('Initial role IDs:', initialValues.roleIds);
      console.log('Available role options:', roleOptions);
      
      // Check if roleOptions contains all the expected role IDs
      const matchedRoles = roleOptions.filter(option => 
        initialValues.roleIds.includes(option.value)
      );
      console.log('Matched roles for display:', matchedRoles);
    }
  }, [isEditMode, initialValues.roleIds, roleOptions]);

  // Custom validation for roleIds based on superAdmin status
  const validateRoleIds = (_, value) => {
    const superAdmin = form.getFieldValue('superAdmin');
    
    if (!superAdmin && (!value || value.length === 0)) {
      return Promise.reject(new Error(t('validation.atLeastOneRole')));
    }
    
    return Promise.resolve();
  };

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
      
      // Ensure roleIds is an array, even if empty
      const roleIds = values.roleIds || [];
      
      // Validate role selection if not superAdmin
      if (!values.superAdmin && roleIds.length === 0) {
        toast.error(t('validation.atLeastOneRole'));
        setLoading(false);
        return;
      }
      
      if (isEditMode && id) {
        // Update existing user
        const updateData: UserUpdateRequest = {
          username: values.username,
          email: values.email,
          fullName: values.fullName,
          roleIds: roleIds,
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
          roleIds: roleIds,
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
      
      <div style={{ padding: '24px 16px' }}>
        <Card
          title={isEditMode ? t('users.editDetails') : t('users.createDetails')}
        >
          {loading && (
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
              zIndex: 1000
            }}>
              <Spin size="large" />
            </div>
          )}
          
          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={(
                    <>
                      {t('users.fields.username')} <Text type="danger">*</Text>
                    </>
                  )}
                  name="username"
                  rules={[{ required: true, message: t('validation.required') }]}
                  validateStatus={usernameError ? 'error' : undefined}
                  help={usernameError}
                >
                  <Input 
                    onChange={(e) => {
                      setUsernameError(null); // Clear previous error
                      if (e.target.value.length >= 3) {
                        checkUsernameAvailability(e.target.value, () => {});
                      }
                    }}
                    suffix={checkingUsername ? <LoadingOutlined /> : null}
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  label={(
                    <>
                      {t('users.fields.email')} <Text type="danger">*</Text>
                    </>
                  )}
                  name="email"
                  rules={[
                    { required: true, message: t('validation.required') },
                    { type: 'email', message: t('validation.invalidEmail') }
                  ]}
                  validateStatus={emailError ? 'error' : undefined}
                  help={emailError}
                >
                  <Input 
                    type="email" 
                    onChange={(e) => {
                      setEmailError(null); // Clear previous error
                      if (e.target.value.includes('@')) {
                        checkEmailAvailability(e.target.value, () => {});
                      }
                    }}
                    suffix={checkingEmail ? <LoadingOutlined /> : null}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={(
                    <>
                      {t('users.fields.fullName')} <Text type="danger">*</Text>
                    </>
                  )}
                  name="fullName"
                  rules={[
                    { required: true, message: t('validation.required') },
                    { max: 100, message: t('validation.fullNameMaxLength') }
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="roleIds"
                  label={t('users.fields.roles')}
                  rules={[{ required: true, message: t('validation.atLeastOneRole') }]}
                >
                  <Select
                    mode="multiple"
                    placeholder={t('users.placeholders.selectRoles')}
                    value={form.getFieldValue('roleIds')} // Bind Formik value
                    onChange={(value) => form.setFieldsValue({ roleIds: value })} // Update Formik value
                    options={roleOptions} // Use the role options fetched from API
                    loading={fetchingRoles} // Show loading spinner while fetching roles
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={t('users.fields.superAdmin')}
                  name="superAdmin"
                  valuePropName="checked"
                >
                  <Checkbox onChange={() => {
                    // Trigger validation of roleIds field when superAdmin changes
                    setTimeout(() => form.validateFields(['roleIds']), 0);
                  }} />
                </Form.Item>
                <Text type="secondary">
                  {t('users.superAdminHint')}
                </Text>
              </Col>
            </Row>
            
            {!isEditMode && (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={(
                      <>
                        {t('users.fields.password')} <Text type="danger">*</Text>
                      </>
                    )}
                    name="password"
                    rules={[
                      { required: true, message: t('validation.required') },
                      { min: 6, message: t('validation.passwordMinLength') }
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    label={(
                      <>
                        {t('users.fields.confirmPassword')} <Text type="danger">*</Text>
                      </>
                    )}
                    name="confirmPassword"
                    rules={[
                      { required: true, message: t('validation.required') },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error(t('validation.passwordsMustMatch')));
                        },
                      }),
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>
                </Col>
              </Row>
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              borderTop: '1px solid #f0f0f0',
              paddingTop: 16,
              marginTop: 16
            }}>
              <Button onClick={() => navigate('/users')}>
                {t('common.cancel')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={loading || checkingUsername || checkingEmail || !!usernameError || !!emailError}
                icon={<SaveOutlined />}
              >
                {t('common.save')}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default UserForm;