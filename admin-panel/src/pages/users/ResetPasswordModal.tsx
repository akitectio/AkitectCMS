import { Button, Form, Input, Modal } from 'antd';
import { useTranslation } from 'react-i18next';

interface ResetPasswordModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (password: string) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  onCancel,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const handleSubmit = (values: { password: string; confirmPassword: string }) => {
    onSubmit(values.password);
  };

  return (
    <Modal
      title={t('users.modals.resetPasswordTitle')}
      open={open}
      onCancel={onCancel}
      footer={null}
      maskClosable={false}
      destroyOnClose
    >
      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSubmit}
        preserve={false}
      >
        <Form.Item
          name="password"
          label={t('users.fields.newPassword')}
          rules={[
            { required: true, message: t('validation.required') },
            { min: 6, message: t('validation.passwordMinLength') }
          ]}
        >
          <Input.Password />
        </Form.Item>
        
        <Form.Item
          name="confirmPassword"
          label={t('users.fields.confirmPassword')}
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <Button style={{ marginRight: 8 }} onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type="primary" htmlType="submit">
            {t('common.confirm')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};