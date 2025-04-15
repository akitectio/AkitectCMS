import { Button, Modal, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { VARIANT_TYPES } from '../utils/component-properties';

const { Text } = Typography;

interface ConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  confirmVariant?: VARIANT_TYPES;
}

// Maps Bootstrap variants to Ant Design button types
const mapVariantToType = (variant?: VARIANT_TYPES): "primary" | "default" | "dashed" | "link" | "text" | undefined => {
  switch (variant) {
    case 'primary':
      return 'primary';
    case 'success':
      return 'primary'; // Ant Design button doesn't have success type, use primary with custom color
    case 'danger':
      return 'primary'; // Ant Design has danger property, not type
    default:
      return 'default';
  }
};

// Maps Bootstrap variants to Ant Design button properties
const getButtonProps = (variant?: VARIANT_TYPES) => {
  const type = mapVariantToType(variant);
  const isDanger = variant === 'danger';
  
  return {
    type,
    danger: isDanger,
    style: variant === 'success' ? { backgroundColor: '#52c41a', borderColor: '#52c41a' } : undefined
  };
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onCancel,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  confirmVariant = 'primary',
}) => {
  const { t } = useTranslation();
  const buttonProps = getButtonProps(confirmVariant);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      centered
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {cancelText || t('common.cancel')}
        </Button>,
        <Button 
          key="confirm" 
          {...buttonProps}
          onClick={onConfirm}
        >
          {confirmText || t('common.confirm')}
        </Button>
      ]}
    >
      <Text>{message}</Text>
    </Modal>
  );
};