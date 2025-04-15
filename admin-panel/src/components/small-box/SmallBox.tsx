import { RightOutlined } from '@ant-design/icons';
import { Button, Card, Statistic, Typography } from 'antd';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { VARIANT_TYPES } from '../../utils/component-properties';
import { OverlayLoading } from '../OverlayLoading';

const { Text } = Typography;

export interface SmallBoxProps {
  loading?: 'dark' | boolean;
  variant: VARIANT_TYPES;
  icon?: {
    content: ReactNode;
    variant?: VARIANT_TYPES;
  };
  text: string;
  title: string;
  navigateTo: string;
}

// Map Bootstrap variants to Ant Design colors
const variantToColor = (variant: VARIANT_TYPES): string => {
  switch (variant) {
    case 'primary': return '#1890ff';
    case 'info': return '#1890ff';
    case 'success': return '#52c41a';
    case 'warning': return '#faad14';
    case 'danger': return '#ff4d4f';
    case 'dark': return '#001529';
    case 'secondary': return '#6c757d';
    case 'light': return '#f8f9fa';
    default: return '#1890ff';
  }
};

const StyledCard = styled(Card)<{ $bgColor: string }>`
  background-color: ${props => props.$bgColor};
  color: ${props => props.$bgColor === '#f8f9fa' ? '#000' : '#fff'};
  border: none;
  overflow: hidden;
  
  .ant-card-body {
    padding: 20px;
  }
  
  .ant-statistic-content {
    color: ${props => props.$bgColor === '#f8f9fa' ? '#000' : '#fff'};
  }
  
  .ant-statistic-title {
    color: ${props => props.$bgColor === '#f8f9fa' ? '#000' : '#fff'};
  }
`;

const IconWrapper = styled.div<{ $bgColor: string }>`
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0.3;
  font-size: 70px;
  color: ${props => props.$bgColor === '#f8f9fa' ? '#000' : '#fff'};
`;

const LinkButton = styled(Button)<{ $bgColor: string }>`
  background-color: ${props => props.$bgColor === '#f8f9fa' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'};
  color: ${props => props.$bgColor === '#f8f9fa' ? '#000' : '#fff'};
  border: none;
  width: 100%;
  margin-top: 10px;
  text-align: center;
  
  &:hover {
    background-color: ${props => props.$bgColor === '#f8f9fa' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'};
    color: ${props => props.$bgColor === '#f8f9fa' ? '#000' : '#fff'};
  }
`;

const SmallBox = ({
  variant = 'info',
  icon,
  text,
  title,
  navigateTo,
  loading,
}: SmallBoxProps) => {
  const [t] = useTranslation();
  const bgColor = variantToColor(variant);
  
  const iconContent = useMemo(() => {
    return (
      <IconWrapper $bgColor={bgColor}>
        {icon?.content || <i className="far fa-envelope" />}
      </IconWrapper>
    );
  }, [icon, bgColor]);

  return (
    <StyledCard $bgColor={bgColor}>
      {iconContent}
      <Statistic 
        value={text}
        title={<Text strong style={{ color: bgColor === '#f8f9fa' ? '#000' : '#fff' }}>{title}</Text>}
        valueStyle={{ color: bgColor === '#f8f9fa' ? '#000' : '#fff', fontSize: '28px' }}
      />
      <Link to={navigateTo}>
        <LinkButton $bgColor={bgColor} block>
          {t('main.label.moreInfo')} <RightOutlined />
        </LinkButton>
      </Link>

      {loading && (
        <OverlayLoading
          type={typeof loading === 'string' ? loading : 'light'}
        />
      )}
    </StyledCard>
  );
};

export default SmallBox;
