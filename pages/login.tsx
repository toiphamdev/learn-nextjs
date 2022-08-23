import Button from '@mui/material/Button';
import Head from 'next/head';
import styled from 'styled-components';
import Image from 'next/image';
import WhatsAppLogo from '../access/whatsapplogo.png';
import { useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { auth } from '../configs/firebase';

const StyledContainer = styled.div`
    height: 100vh;
    display: grid;
    place-items: center;
    background-color: #fff;
`;

const StyledLoginContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100px;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -1px rgb(0 0 0 / 0.1);
`;

const StyledImageWrapper = styled.div`
    margin-bottom: 50px;
`;

function Login() {
    const [signInWithGoogle, _user, _loading, _error] = useSignInWithGoogle(auth);
    return (
        <StyledContainer>
            <Head>
                <title>Login</title>
            </Head>
            <StyledLoginContainer>
                <StyledImageWrapper>
                    <Image src={WhatsAppLogo} alt="Whatsapp logo" height={'200px'} width="200px" />
                </StyledImageWrapper>
                <Button
                    variant="outlined"
                    onClick={() => {
                        signInWithGoogle();
                    }}
                >
                    LOGIN WITH GOOGLE
                </Button>
            </StyledLoginContainer>
        </StyledContainer>
    );
}

export default Login;
