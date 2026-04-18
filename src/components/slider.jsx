import styled from 'styled-components';

const Slider = ({
    label,
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    valueText,
    ariaLabel,
}) => {
    const displayValue = valueText ?? String(value);
    const progress = max === min ? 0 : ((value - min) / (max - min)) * 100;
    const clampedProgress = Math.min(100, Math.max(0, progress));

    return (
        <Wrapper>
            <Label>{label}</Label>
            <Container>
                <Range
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={onChange}
                    $progress={clampedProgress}
                    aria-label={ariaLabel ?? label}
                />
                <Value>{displayValue}</Value>
            </Container>
        </Wrapper>
    );
};

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const Label = styled.label`
    margin: 0;
    color: var(--white);
    font-size: 16px;
    font-weight: 700;
    line-height: normal;
`;

const Container = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const Value = styled.span`
    font-size: 14px;
    font-weight: 500;
    line-height: normal;
    text-align: left;
    min-width: 40px;
    color: var(--white);
`;

const Range = styled.input`
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 100px;
    outline: none;
    cursor: pointer;

    background: linear-gradient(
        to right,
      #138685 0%,
        var(--mint) ${({ $progress }) => $progress}%,
        rgba(255, 255, 255, 0.4) ${({ $progress }) => $progress}%
    );

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background-color: var(--mint);
        box-shadow: 0 0 6px rgba(77, 236, 236, 0.2);
        cursor: pointer;
        transition: transform 0.1s ease;

        &:hover {
            transform: scale(1.3);
        }
    }

    &::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border: none;
        border-radius: 50%;
        background-color: var(--mint);
        box-shadow: 0 0 6px rgba(77, 236, 236, 0.2);
        cursor: pointer;
        transition: transform 0.1s ease;

        &:hover {
            transform: scale(1.3);
        }
    }

    &::-moz-range-track {
        background: transparent;
    }
`;

export default Slider;
