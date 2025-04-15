import { Layout, Space, Typography } from 'antd';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import packageJSON from '../../../../package.json';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

const StyledFooter = styled(AntFooter)`
  padding: 16px 24px;
  background-color: #f4f6f9;
  border-top: 1px solid #dee2e6;
  font-size: 14px;
  color: #869099;
  position: relative;
  z-index: 10;
`;

const FooterContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const Footer = ({
  style = {},
  containered,
}: {
  style?: React.CSSProperties;
  containered?: boolean;
}) => {
  const [t] = useTranslation();

  return (
    <StyledFooter style={{ ...style }}>
      <FooterContainer className={containered ? 'container' : ''}>
        <Space>
          <Text strong>
            Copyright © {DateTime.now().toFormat('y')}{' '}
            <Link 
              href="https://akitect.io"
              target="_blank" 
              rel="noopener noreferrer"
            >
              akitect.io
            </Link>
          </Text>
        </Space>
        <Space>
          <Text strong>{t('footer.version')}</Text>
          <Text>{packageJSON.version}</Text>
        </Space>
      </FooterContainer>
    </StyledFooter>
  );
};

export default Footer;
