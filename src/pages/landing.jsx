import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import logoText from '../assets/images/logo-text.png';
import logoIcon from '../assets/images/logo-icon.png';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <Wrapper>
        <Content>
            <LogoContainer>
                <LogoText src={logoText} />
                <LogoIcon src={logoIcon} />
            </LogoContainer>
            <OrderButton type="button" onClick={() => navigate('/step1-mood')}>
                주문하기
            </OrderButton>
        </Content>
    </Wrapper>
  );
};

const Wrapper = styled.main`
    height: 100dvh;
    width: 100%;
    display: flex;
    justify-content: center;
    background-color: var(--black);
    overflow: hidden;
`;

const Content = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 60px;
`;

const LogoContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 50px;
`;

const LogoText = styled.img`
    width: min(220px, 60vw);
    height: auto;
`;

const LogoIcon = styled.img`
    width: min(240px, 70vw);
    height: auto;
`;

const OrderButton = styled.button`
    width: 100%;
    max-width: 300px;
    padding: 12px 0px;
    border: 2px solid var(--mint);
    border-radius: 100px;
    box-shadow: 2px 2px 10px 0 rgba(114, 235, 234, 0.2);
    background-color: transparent;
    color: #A0F4F4;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    line-height: normal;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;

    &:hover {
        background-color: var(--mint);
        color: var(--black);
    }
`;

export default Landing;
