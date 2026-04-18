import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/header';
import Option from '../components/option';
import Slider from '../components/slider';
import Button from '../components/button';

const BASE_OPTIONS = [
  { id: 'gin', label: '진' },
  { id: 'vodka', label: '보드카' },
  { id: 'rum', label: '럼' },
  { id: 'tequila', label: '데킬라' },
  { id: 'whisky', label: '위스키' },
  { id: 'recommend', label: '추천' },
];

const Step2Taste = () => {
  const navigate = useNavigate();
  const [selectedBase, setSelectedBase] = useState('recommend');
  const [abv, setAbv] = useState(10);
  const [sweetness, setSweetness] = useState(3);
  const [sourness, setSourness] = useState(3);
  const [bitterness, setBitterness] = useState(3);
  const [sparkling, setSparkling] = useState(null);

  const sliders = useMemo(
    () => [
      {
        id: 'abv',
        label: '도수(ABV)',
        value: abv,
        min: 0,
        max: 40,
        step: 5,
        text: `${abv}%`,
        onChange: (e) => setAbv(Number(e.target.value)),
      },
      {
        id: 'sweetness',
        label: '단맛',
        value: sweetness,
        min: 1,
        max: 5,
        step: 1,
        text: `${sweetness}`,
        onChange: (e) => setSweetness(Number(e.target.value)),
      },
      {
        id: 'sourness',
        label: '신맛',
        value: sourness,
        min: 1,
        max: 5,
        step: 1,
        text: `${sourness}`,
        onChange: (e) => setSourness(Number(e.target.value)),
      },
      {
        id: 'bitterness',
        label: '쓴맛',
        value: bitterness,
        min: 1,
        max: 5,
        step: 1,
        text: `${bitterness}`,
        onChange: (e) => setBitterness(Number(e.target.value)),
      },
    ],
    [abv, sweetness, sourness, bitterness]
  );

  return (
    <Wrapper>
      <Header step={2} />
      <Main>
        <Section>
          <Title>베이스</Title>
          <OptionRow>
            {BASE_OPTIONS.map((base) => (
              <Option
                key={base.id}
                label={base.label}
                selected={selectedBase === base.id}
                onClick={() => setSelectedBase(base.id)}
              />
            ))}
          </OptionRow>
        </Section>

        {sliders.map((slider) => (
          <Section key={slider.id}>
            <Slider
              label={slider.label}
              value={slider.value}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              valueText={slider.text}
              onChange={slider.onChange}
            />
          </Section>
        ))}

        <Section>
          <Title>탄산</Title>
          <OptionRow>
            <SparklingButton
              $selected={sparkling === true}
              onClick={() => setSparkling(true)}
            >
              ON
            </SparklingButton>
            <SparklingButton
              $selected={sparkling === false}
              onClick={() => setSparkling(false)}
            >
              OFF
            </SparklingButton>
            <SparklingButton
              $selected={sparkling === null}
              onClick={() => setSparkling(null)}
            >
              추천
            </SparklingButton>
          </OptionRow>
        </Section>
      </Main>

      <Footer>
        <Button onClick={() => navigate('/loading')}>다음</Button>
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
  gap: 32px;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Title = styled.label`
  font-size: 16px;
  font-weight: 700;
  line-height: normal;
  color: var(--white);
`;

const OptionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const SparklingButton = styled.button`
  min-width: 54px;
  padding: 8px 0;
  border: 1px solid var(--mint);
  border-radius: 100px;
  background-color: ${({ $selected }) => ($selected ? 'var(--mint)' : 'var(--black)')};
  color: ${({ $selected }) => ($selected ? 'var(--black)' : 'var(--mint)')};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 0 8px rgba(87, 255, 246, 0.2);
  }

  &:active {
    transform: scale(0.99);
  }
`;

const Footer = styled.div`
  padding: 12px 20px calc(20px + env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;

  @media (min-width: 500px) {
    padding: 12px 20px 40px;
  }
`;

export default Step2Taste;
