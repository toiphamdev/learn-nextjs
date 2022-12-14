import styled from 'styled-components';
import Image from 'next/image';
import WhatsAppLogo from '../access/whatsapplogo.png';
import { CircularProgress } from '@mui/material';
const StyledContainer = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    height: 100vh;
`;
const StyledImageWrapper = styled.div`
    margin-bottom: 50px;
`;
function Loading() {
    return (
        <StyledContainer>
            <StyledImageWrapper>
                <Image src={WhatsAppLogo} alt="Whatsapp logo" height={'200px'} width="200px" />
            </StyledImageWrapper>
            <CircularProgress />
        </StyledContainer>
    );
}

export default Loading;
