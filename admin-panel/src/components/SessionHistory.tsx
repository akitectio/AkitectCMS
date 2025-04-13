import ConfirmModal from '@app/components/ConfirmModal';
import sessionService, { UserSession } from '@app/services/sessions';
import { format, formatDistance } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Badge, Button, Card, Spinner, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const SessionHistory: React.FC = () => {
  const [t] = useTranslation();
  const [loading, setLoading] = useState<boolean>(true);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [revokeAllConfirm, setRevokeAllConfirm] = useState<boolean>(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionService.getMySessionHistory();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching session history:', error);
      toast.error(t('sessions.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = (session: UserSession) => {
    if (session.isCurrent) {
      toast.warn(t('sessions.errors.cannotRevokeCurrent'));
      return;
    }

    setSelectedSession(session);
    setShowConfirmModal(true);
  };

  const confirmRevokeSession = async () => {
    if (!selectedSession) return;

    try {
      setLoading(true);
      await sessionService.revokeSession(selectedSession.id);
      toast.success(t('sessions.messages.revokeSuccess'));
      fetchSessions();
    } catch (error) {
      console.error('Error revoking session:', error);
      toast.error(t('sessions.errors.revokeFailed'));
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
      setSelectedSession(null);
    }
  };

  const handleRevokeAllOtherSessions = () => {
    setRevokeAllConfirm(true);
  };

  const confirmRevokeAllOtherSessions = async () => {
    try {
      setLoading(true);
      await sessionService.revokeAllOtherSessions();
      toast.success(t('sessions.messages.revokeAllSuccess'));
      fetchSessions();
    } catch (error) {
      console.error('Error revoking all other sessions:', error);
      toast.error(t('sessions.errors.revokeAllFailed'));
    } finally {
      setLoading(false);
      setRevokeAllConfirm(false);
    }
  };

  const renderSessionStatus = (session: UserSession) => {
    if (session.isCurrent) {
      return <Badge bg="primary">{t('sessions.current')}</Badge>;
    } else if (session.revokedAt) {
      return <Badge bg="danger">{t('sessions.revoked')}</Badge>;
    } else if (session.isExpired) {
      return <Badge bg="warning">{t('sessions.expired')}</Badge>;
    } else if (session.active) {
      return <Badge bg="success">{t('sessions.active')}</Badge>;
    } else {
      return <Badge bg="secondary">{t('sessions.inactive')}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="card-title">{t('sessions.history')}</h3>
            <Button 
              variant="danger" 
              size="sm" 
              onClick={handleRevokeAllOtherSessions}
            >
              {t('sessions.revokeAllOtherDevices')}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {loading && sessions.length === 0 ? (
            <div className="text-center p-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>{t('sessions.device')}</th>
                  <th>{t('sessions.ipAddress')}</th>
                  <th>{t('sessions.loginTime')}</th>
                  <th>{t('sessions.lastActivity')}</th>
                  <th>{t('sessions.status')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      {t('sessions.noSessions')}
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr key={session.id}>
                      <td>{session.deviceInfo}</td>
                      <td>{session.ipAddress}</td>
                      <td title={format(new Date(session.createdAt), 'PPpp')}>
                        {formatDistance(new Date(session.createdAt), new Date(), { addSuffix: true })}
                      </td>
                      <td title={format(new Date(session.lastActivity), 'PPpp')}>
                        {formatDistance(new Date(session.lastActivity), new Date(), { addSuffix: true })}
                      </td>
                      <td>{renderSessionStatus(session)}</td>
                      <td>
                        {session.active && !session.isExpired && !session.revokedAt && !session.isCurrent && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRevokeSession(session)}
                          >
                            {t('sessions.revoke')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Confirm Revoke Modal */}
      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={confirmRevokeSession}
        title={t('sessions.modals.revokeTitle')}
        message={t('sessions.modals.revokeMessage')}
      />

      {/* Confirm Revoke All Modal */}
      <ConfirmModal
        show={revokeAllConfirm}
        onHide={() => setRevokeAllConfirm(false)}
        onConfirm={confirmRevokeAllOtherSessions}
        title={t('sessions.modals.revokeAllTitle')}
        message={t('sessions.modals.revokeAllMessage')}
      />
    </>
  );
};

export default SessionHistory;