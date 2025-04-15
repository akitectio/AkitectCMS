import { MailOutlined } from '@ant-design/icons';
import { envConfig } from '@app/configs/loadEnv';
import { setWindowClass } from '@app/utils/helpers';
import { Button, Card, Form, Input, Typography } from 'antd';
import { Rule } from 'antd/es/form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const { Title, Text } = Typography;

const ForgotPasswordContainer = styled.div`
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

const ForgotPassword = () => {
  const [t] = useTranslation();
  const [loading, setLoading] = useState(false);

  const onFinish = (values: { email: string }) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.warn('Not yet functional');
      console.log('values', values);
      setLoading(false);
    }, 1000);
  };

  // Add validation schema
  const validationRules = {
    email: [
      { required: true, message: 'Email is required!' } as Rule,
      { type: 'email', message: 'Invalid email address!' } as Rule
    ]
  };

  setWindowClass('hold-transition login-page');

  return (
    <ForgotPasswordContainer>
      <StyledCard>
        <StyledTitle level={3}>
          <Link to="/">{envConfig.siteName}</Link>
        </StyledTitle>
        
        <Text style={{ display: 'block', textAlign: 'center', marginBottom: '24px' }}>
          {t('recover.forgotYourPassword')}
        </Text>
        
        <Form
          name="forgotPassword"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={validationRules.email}
          >
            <Input 
              prefix={<MailOutlined />}
              placeholder="Email"
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
              {t('recover.requestNewPassword')}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <Link to="/login">{t('login.button.signIn.label')}</Link>
        </div>
      </StyledCard>
    </ForgotPasswordContainer>
  );
};

export default ForgotPassword;
