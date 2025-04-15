import { Spin } from 'antd';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;
`;

const AnimatedLogo = styled.img`
  animation: pulse 1.5s infinite ease-in-out;
  height: 60px;
  width: 60px;
  margin-bottom: 20px;

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      opacity: 0.7;
    }
    50% {
      transform: scale(1.05);
      opacity: 1;
    }
    100% {
      transform: scale(0.95);
      opacity: 0.7;
    }
  }
`;

export const Loading = () => {
  return (
    <LoadingContainer>
      <AnimatedLogo src="/img/logo.png" alt="Logo" />
      <Spin size="large" />
    </LoadingContainer>
  );
};
