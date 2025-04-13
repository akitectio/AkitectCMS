import ContentHeader from '@app/components/content-header';
import SessionHistory from '@app/components/SessionHistory';
import React from 'react';
import { useTranslation } from 'react-i18next';

const SessionManagement: React.FC = () => {
  const [t] = useTranslation();
  
  return (
    <>
      <ContentHeader title={t('sessions.sessionManagement')} />
      
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <SessionHistory />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SessionManagement;