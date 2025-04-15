import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import styled from 'styled-components';

const OverlayContainer = styled.div<{ $isDark?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.$isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)'};
  z-index: 10;
  border-radius: inherit;
`;

const spinIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

export const OverlayLoading = ({
  type = 'light',
}: {
  type?: 'dark' | 'light';
}) => {
  return (
    <OverlayContainer $isDark={type === 'dark'}>
      <Spin indicator={spinIcon} />
    </OverlayContainer>
  );
};
