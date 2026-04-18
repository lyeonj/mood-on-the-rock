import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import cocktailIcon from '../assets/images/favicon.png';

const Loading = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/step3-result');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Wrapper>
      <Content>
        <Loader>
          <ProgressRing />
          <Icon src={cocktailIcon} />
        </Loader>
        <Message>Mixing your Mood</Message>
      </Content>
    </Wrapper>
  );
};

const Wrapper = styled.main`
  min-height: 100dvh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--black);
`;

const Content = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const Loader = styled.div`
  position: relative;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
`;

const ProgressRing = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 0%,
    var(--mint) 95%,
    transparent 100%
  );
  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 5px),
    #fff calc(100% - 5px)
  );
  mask: radial-gradient(
    farthest-side,
    transparent calc(100% - 5px),
    #fff calc(100% - 5px)
  );
  animation: ${spin} 2.5s linear infinite;
`;

const Icon = styled.img`
  width: 64px;
  height: auto;
`;

const Message = styled.p`
  color: var(--mint);
  font-size: 18px;
  font-weight: 400;
  animation: ${pulse} 2s ease-in-out infinite;
  cursor: default;
`;

export default Loading;
