import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface ConfirmModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  confirmVariant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  show,
  onHide,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  confirmVariant = 'primary',
}) => {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {cancelText || t('common.cancel')}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm}>
          {confirmText || t('common.confirm')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};