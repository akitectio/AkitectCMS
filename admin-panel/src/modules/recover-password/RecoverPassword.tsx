import { LockOutlined } from '@ant-design/icons';
import { envConfig } from '@app/configs/loadEnv';
import { setWindowClass } from '@app/utils/helpers';
import { Button, Card, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const { Title, Text } = Typography;

const RecoverPasswordContainer = styled.div`
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
  margin-bottom: 20px !important;
`;

const RecoverPassword = () => {
  const [t] = useTranslation();
  const [loading, setLoading] = useState(false);

  // Add validation schema
  const validationRules = {
    password: [
      { required: true, message: 'Password is required!' },
      { min: 5, message: 'Must be 5 characters or more' },
      { max: 30, message: 'Must be 30 characters or less' }
    ],
    confirmPassword: [
      { required: true, message: 'Please confirm your password!' },
      ({ getFieldValue }) => ({
        validator(_, value) {
          if (!value || getFieldValue('password') === value) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('The two passwords do not match!'));
        },
      })
    ]
  };

  const onFinish = (values: { password: string; confirmPassword: string }) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.warn('Not yet functional');
      console.log('values', values);
      setLoading(false);
    }, 1000);
  };

  setWindowClass('hold-transition login-page');
  
  return (
    <RecoverPasswordContainer>
      <StyledCard>
        <StyledTitle level={3}>
          <Link to="/">{envConfig.siteName}</Link>
        </StyledTitle>
        
        <Text style={{ display: 'block', textAlign: 'center', marginBottom: '24px' }}>
          {t('recover.oneStepAway')}
        </Text>
        
        <Form
          name="recoverPassword"
          onFinish={onFinish}
          layout="vertical"
        >
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

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={validationRules.confirmPassword}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={loading}
              block
              size="large"
            >
              {t('recover.changePassword')}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <Link to="/login">{t('login.button.signIn.label')}</Link>
        </div>
      </StyledCard>
    </RecoverPasswordContainer>
  );
};

export default RecoverPassword;
