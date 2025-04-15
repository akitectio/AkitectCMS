import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { envConfig } from '@app/configs/loadEnv';
import { useAppDispatch, useAppSelector } from '@app/store/store';
import { setWindowClass } from '@app/utils/helpers';
import { loginRequest } from '@store/reducers/auth';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const { Title, Text } = Typography;

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
`;

const StyledCard = styled(Card)`
  width: 400px;
  max-width: 90%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const StyledTitle = styled(Title)`
  text-align: center;
  margin-bottom: 30px !important;
`;

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [t] = useTranslation();
  const [form] = Form.useForm();
  
  // Get auth state from Redux store
  const { loading: isAuthLoading, currentUser, formValues, error } = useAppSelector(state => state.auth);

  // Check for token and redirect to dashboard if it exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Navigate to homepage if user is authenticated
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Update form values when Redux store changes
  useEffect(() => {
    if (formValues) {
      form.setFieldsValue({
        username: formValues.username || '',
        password: formValues.password || '',
      });
    }
  }, [formValues, form]);

  const onFinish = (values: { username: string; password: string }) => {
    // Dispatch login action to trigger the saga
    dispatch(loginRequest({ username: values.username, password: values.password }));
  };

  // Add validation schema (equivalent to Yup schema in old code)
  const validationRules = {
    username: [{ required: true, message: 'Please input your username!' }],
    password: [
      { required: true, message: 'Please input your password!' },
      { min: 5, message: 'Must be 5 characters or more' },
      { max: 30, message: 'Must be 30 characters or less' }
    ]
  };

  setWindowClass('hold-transition login-page');

  return (
    <LoginContainer>
      <StyledCard>
        <StyledTitle level={3}>
          <Link to="/">{envConfig.siteName}</Link>
        </StyledTitle>

        <Text style={{ display: 'block', textAlign: 'center', marginBottom: '24px' }}>
          {t('login.label.signIn')}
        </Text>

        {error && (
          <Alert
            message="Login Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        <Form
          form={form}
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={validationRules.username}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Username" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={validationRules.password}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isAuthLoading}
              disabled={isAuthLoading}
              block
              size="large"
            >
              {t('login.button.signIn.label')}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Link to="/forgot-password" style={{ marginRight: '8px' }}>
              {t('login.label.forgotPass')}
            </Link>
          </div>
        </Form>
      </StyledCard>
    </LoginContainer>
  );
};

export default Login;
