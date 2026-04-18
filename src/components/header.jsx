import styled from 'styled-components';
import logoText from '../assets/images/logo-text.png';

const clampStep = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return 1;
    return Math.min(3, Math.max(1, Math.round(n)));
};

const Header = ({ step = 1 }) => {
    const currentStep = clampStep(step);

    return (
        <Wrapper>
            <Logo src={logoText} />
            <Stepper role="navigation" aria-label="주문 단계">
                <StepNode $active={currentStep === 1} aria-current={currentStep === 1 ? 'step' : undefined}>
                1
                </StepNode>
                <Connector aria-hidden />
                <StepNode $active={currentStep === 2} aria-current={currentStep === 2 ? 'step' : undefined}>
                2
                </StepNode>
                <Connector aria-hidden />
                <StepNode $active={currentStep === 3} aria-current={currentStep === 3 ? 'step' : undefined}>
                3
                </StepNode>
            </Stepper>
        </Wrapper>
  );
};

const Wrapper = styled.header`
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 12px 20px;
`;

const Logo = styled.img`
    display: block;
    height: 40px;
    width: auto;
`;

const Stepper = styled.div`
    display: flex;
    align-items: center;
    gap: 0;
`;

const StepNode = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    box-sizing: border-box;
    font-size: 12px;
    font-weight: 500;
    line-height: normal;
    flex-shrink: 0;
    border: 1px solid var(--mint);
    color: var(--mint);
    background-color: transparent;
    cursor: default;

    ${({ $active }) =>
        $active &&
        `
        background-color: var(--mint);
        color: var(--black);
    `}
`;

const Connector = styled.span`
    width: 16px;
    height: 1.5px;
    background-color: var(--mint);
`;

export default Header;
