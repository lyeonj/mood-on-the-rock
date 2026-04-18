import styled from 'styled-components';

const Option = ({ emoji, label, selected, type = 'button', ...rest }) => (
    <StyledOption type={type} $active={selected} aria-pressed={selected} {...rest}>
        <span aria-hidden>{emoji}</span> {label}
    </StyledOption>
);

const StyledOption = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 400;
    line-height: normal;
    color: var(--white);
    background: transparent;
    border: 0.9px solid #F0F0F0;
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;

    @media (hover: hover) and (pointer: fine) {
        &:hover {
            transform: scale(1.02);
        }
    }

    ${({ $active }) =>
        $active &&
        `
        border-color: var(--mint);
        color: var(--mint);
        
        box-shadow: 0 0 0 1px rgba(114, 235, 234, 0.25);
    `}
`;

export default Option;
