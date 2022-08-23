import {
    Avatar,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import styled from 'styled-components';
import ChatIcon from '@mui/icons-material/Chat';
import MoreVerticalIcon from '@mui/icons-material/MoreVert';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import { signOut } from 'firebase/auth';
import { auth, db } from '../configs/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useState } from 'react';
import * as EmailValidator from 'email-validator';
import { addDoc, collection, query, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Conversation } from '../types';
import ConversationSelect from './ConversationSelect';

const StyledContainer = styled.div`
    height: 100vh;
    min-width: 300px;
    max-width: 350px;
    overflow-y: scroll;
    border-right: 1px solid whitesmoke;
    ::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
`;
const StyledHeader = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 15px;
    background-color: #fff;
    height: 80px;
    border-bottom: 1px solid whitesmoke;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 1;
`;
const StyledSearch = styled.div`
    display: flex;
    align-items: center;
    padding: 15px;
    border-radius: 2px;
`;
const StyledSidebarButton = styled(Button)`
    width: 100%;
    border-top: 1px solid whitesmoke;
    border-bottom: 1px solid whitesmoke;
`;
const StyledUserAvatar = styled(Avatar)`
    cursor: pointer;
    :hover {
        opacity: 0.8;
    }
`;
const StyledSearchInput = styled.input`
    outline: none;
    border: none;
    flex: 1;
`;

const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.log(error);
    }
};

function Sidebar() {
    const [loggedInUser, _loading, _error] = useAuthState(auth);
    const [isOpenNewConversationDialog, setIsOpenNewConversationDialog] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');
    const toggleNewConversationDialog = (isOpen: boolean) => {
        setIsOpenNewConversationDialog(isOpen);
        if (!isOpen) setRecipientEmail('');
    };
    const isInvitingSelf = recipientEmail === loggedInUser?.email;
    const getConversationForCurrentUser = query(
        collection(db, 'conversations'),
        where('users', 'array-contains', loggedInUser?.email)
    );
    const [conversationSnapshot, __loading, __error] = useCollection(getConversationForCurrentUser);
    const isConversationAlreadyExit = (recipientEmail: string) => {
        return conversationSnapshot?.docs.find((conversation) =>
            (conversation.data() as Conversation).users.includes(recipientEmail)
        );
    };
    const createConversation = async () => {
        if (!recipientEmail) return;
        if (
            EmailValidator.validate(recipientEmail) &&
            !isInvitingSelf &&
            !isConversationAlreadyExit(recipientEmail)
        ) {
            await addDoc(collection(db, 'conversations'), {
                users: [loggedInUser?.email, recipientEmail],
            });
        }
        toggleNewConversationDialog(false);
    };

    return (
        <StyledContainer>
            <StyledHeader>
                <Tooltip title={loggedInUser?.email as string} placement="right">
                    <StyledUserAvatar src={loggedInUser?.photoURL || ''} />
                </Tooltip>
                <div>
                    <IconButton>
                        <ChatIcon />
                    </IconButton>
                    <IconButton>
                        <MoreVerticalIcon />
                    </IconButton>
                    <IconButton onClick={() => logout()}>
                        <LogoutIcon />
                    </IconButton>
                </div>
            </StyledHeader>
            <StyledSearch>
                <SearchIcon />
                <StyledSearchInput placeholder="Search convertation" />
            </StyledSearch>
            <StyledSidebarButton onClick={() => toggleNewConversationDialog(true)}>
                START A NEW CONVERSATION
            </StyledSidebarButton>
            <Dialog
                open={isOpenNewConversationDialog}
                onClose={() => toggleNewConversationDialog(false)}
            >
                <DialogTitle>New Conversation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter a Google email address for the user you wish to chat with
                    </DialogContentText>
                    <TextField
                        autoFocus
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="standard"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => toggleNewConversationDialog(false)}>Cancel</Button>
                    <Button disabled={!recipientEmail} onClick={createConversation}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
            {conversationSnapshot?.docs.map((conversation) => {
                return (
                    <ConversationSelect
                        key={conversation.id}
                        id={conversation.id}
                        conversationUsers={(conversation.data() as Conversation).users}
                    />
                );
            })}
        </StyledContainer>
    );
}

export default Sidebar;
