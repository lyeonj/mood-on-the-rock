import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/header';
import Button from '../components/button';
import cocktailImage from '../assets/images/ex-cocktail.png';

const Step3Result = () => {
  const navigate = useNavigate();
  const [extraRequest, setExtraRequest] = useState('');

  const cocktailName = '상큼한 모히또';

  return (
    <Wrapper>
      <Header step={3} />
      <Main>
        <ResultSection>
          <CocktailImage src={cocktailImage} />
          <CocktailName>{cocktailName}</CocktailName>
          <Divider />
        </ResultSection>

        <RequestSection>
          <Title>추가 요청</Title>
          <RequestInput
            value={extraRequest}
            onChange={(e) => setExtraRequest(e.target.value)}
            placeholder="예) 달달한 과일향, 민트는 빼고, 카페인/우유는 제외 등"
          />
        </RequestSection>
      </Main>

      <Footer>
        <Button onClick={() => navigate('/success')}>완료</Button>
      </Footer>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  min-height: 100dvh;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: var(--black);
`;

const Main = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 60px;
`;

const ResultSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60px;
`;

const CocktailImage = styled.img`
  width: min(140px, 40vw);
  height: auto;
`;

const CocktailName = styled.span`
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: var(--white);
  margin-top: 40px;
  cursor: default;
`;

const Divider = styled.div`
  width: min(100px, 30vw);
  border-bottom: 1px solid #A0A0A0;
  margin-top: 16px;
`;

const RequestSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Title = styled.label`
  font-size: 16px;
  font-weight: 700;
  line-height: normal;
  color: var(--white);
`;

const RequestInput = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  resize: none;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1.5px dashed #A0A0A0;
  background-color: var(--black);
  color: var(--white);
  font-size: 16px;
  font-weight: 400;

  &::placeholder {
    color: #A0A0A0;
  }

  &:focus {
    outline: none;
    border-color: var(--white);
  }
`;

const Footer = styled.div`
  padding: 12px 20px calc(20px + env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;

  @media (min-width: 500px) {
    padding: 12px 20px 40px;
  }
`;

export default Step3Result;
