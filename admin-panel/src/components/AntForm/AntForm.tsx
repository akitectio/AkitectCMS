import { RollbackOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Form, Space, Typography } from 'antd';
import { FormProps } from 'antd/lib/form';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface AntFormProps extends FormProps {
  title: string;
  initialValues?: any;
  onFinish: (values: any) => void;
  onFinishFailed?: (errorInfo: any) => void;
  loading?: boolean;
  backUrl?: string;
  submitButtonText?: string;
  children: React.ReactNode;
}

const AntForm: React.FC<AntFormProps> = ({
  title,
  initialValues,
  onFinish,
  onFinishFailed,
  loading = false,
  backUrl,
  submitButtonText = 'Save',
  children,
  ...formProps
}) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  return (
    <Card
      title={<Title level={4}>{title}</Title>}
      bordered={false}
      extra={
        backUrl && (
          <Button
            icon={<RollbackOutlined />}
            onClick={() => navigate(backUrl)}
          >
            Back
          </Button>
        )
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        {...formProps}
      >
        {children}

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              {submitButtonText}
            </Button>
            {backUrl && (
              <Button onClick={() => navigate(backUrl)}>
                Cancel
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AntForm;