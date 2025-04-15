import { Card, Col, Progress, Row, Typography } from 'antd';
import { ReactNode, useMemo } from 'react';
import styled from 'styled-components';
import { VARIANT_TYPES } from '../../utils/component-properties';
import { OverlayLoading } from '../OverlayLoading';

const { Text, Title } = Typography;

export interface InfoBoxProps {
  loading?: 'dark' | boolean;
  icon?: {
    content: ReactNode;
    variant?: VARIANT_TYPES;
  };
  variant?: VARIANT_TYPES;
  title: string;
  text: string;
  progressBar?: {
    description?: string;
    level: number;
    variant?: VARIANT_TYPES;
  };
}

// Map Bootstrap variants to Ant Design colors
const variantToColor = (variant?: VARIANT_TYPES): string => {
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

const StyledCard = styled(Card)<{ $bgColor?: string }>`
  background-color: ${props => props.$bgColor || '#fff'};
  color: ${props => props.$bgColor && props.$bgColor !== '#f8f9fa' ? '#fff' : 'inherit'};
  border: none;
  margin-bottom: 16px;
`;

const IconWrapper = styled.div<{ $bgColor: string }>`
  background-color: ${props => props.$bgColor};
  color: #fff;
  border-radius: 4px;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
`;

export const InfoBox = ({
  variant,
  title,
  text,
  progressBar,
  icon,
  loading,
}: InfoBoxProps) => {
  const iconColor = variantToColor(icon?.variant || variant);
  const progressColor = variantToColor(progressBar?.variant || variant);
  const bgColor = variant ? variantToColor(variant) : undefined;
  
  const progressBarContent = useMemo(() => {
    if (progressBar) {
      return (
        <div style={{ marginTop: '10px' }}>
          <Progress 
            percent={progressBar.level} 
            strokeColor={progressColor}
            size="small"
          />
          {progressBar?.description && (
            <Text 
              type="secondary"
              style={{ 
                color: bgColor && bgColor !== '#f8f9fa' ? 'rgba(255, 255, 255, 0.65)' : undefined
              }}
            >
              {progressBar.description}
            </Text>
          )}
        </div>
      );
    }
    return null;
  }, [progressBar, progressColor, bgColor]);

  const iconContent = useMemo(() => {
    return (
      <IconWrapper $bgColor={iconColor}>
        {icon?.content || <i className="far fa-envelope" />}
      </IconWrapper>
    );
  }, [icon, iconColor]);

  return (
    <StyledCard $bgColor={bgColor} bodyStyle={{ padding: '16px' }}>
      <Row gutter={16} align="middle">
        <Col>
          {iconContent}
        </Col>
        <Col flex="auto">
          <div>
            <Text 
              style={{ 
                fontSize: '16px',
                display: 'block',
                color: bgColor && bgColor !== '#f8f9fa' ? '#fff' : 'inherit'
              }}
            >
              {title}
            </Text>
            <Title 
              level={4} 
              style={{ 
                margin: '8px 0',
                color: bgColor && bgColor !== '#f8f9fa' ? '#fff' : 'inherit'
              }}
            >
              {text}
            </Title>
            {progressBarContent}
          </div>
        </Col>
      </Row>
      {loading && (
        <OverlayLoading
          type={typeof loading === 'string' ? loading : 'light'}
        />
      )}
    </StyledCard>
  );
};
