import styled from 'styled-components';

const Button = ({ type = 'button', children, ...rest }) => (
    <StyledButton type={type} {...rest}>
        {children}
    </StyledButton>
);

const StyledButton = styled.button`
    width: 100%;
    max-width: 100%;
    padding: 14px;
    border: none;
    border-radius: 100px;
    background-color: var(--mint);
    color: var(--black);
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: filter 0.2s ease, transform 0.2s ease;

    &:hover {
        filter: brightness(0.9);
        transform: scale(0.995);
    }
`;

export default Button;
