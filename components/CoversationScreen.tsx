import { AttachFile, InsertEmoticon, Mic, Send } from '@mui/icons-material';
import MoreVert from '@mui/icons-material/MoreVert';
import { IconButton } from '@mui/material';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { KeyboardEventHandler, MouseEventHandler, useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import styled from 'styled-components';
import { auth, db } from '../configs/firebase';
import { useRecipient } from '../hooks/useRecipient';
import { Conversation, IMessage } from '../types';
import {
    convertFireTimestampToString,
    genarateQueryGetMessages,
    transformMessage,
} from '../utils/getMessagesInConversation';
import Message from './Message';
import RecipientAvatar from './RecipientAvatar';

const StyledRecipientHeader = styled.div`
    position: sticky;
    background-color: #fff;
    z-index: 100;
    top: 0;
    display: flex;
    align-items: center;
    padding: 11px;
    height: 80px;
    border-bottom: 1px solid whitesmoke;
`;
const StyledHeaderInfo = styled.div`
    flex-grow: 1;
    > h3 {
        margin-top: 0;
        margin-bottom: 3px;
    }
    > span {
        font-size: 14px;
        color: gray;
    }
`;

const StyledH3 = styled.h3`
    word-break: break-all;
`;

const StyledHeaderIcon = styled.div`
    display: flex;
`;
const StyledMessageContainer = styled.div`
    padding: 10px;
    background-color: #e5ded8;
    min-height: 90vh;
`;

const StyledInputContainer = styled.form`
    display: flex;
    align-items: center;
    padding: 2px;
    position: sticky;
    bottom: 0;
    background-color: #fff;
    z-index: 100;
`;

const StyledInput = styled.input`
    flex-grow: 1;
    outline: none;
    border: none;
    border-radius: 10px;
    background-color: whitesmoke;
    padding: 12px;
    margin: 8px 0;
`;

const EndOfMessageForAutoScroll = styled.div`
    margin-bottom: 80px;
`;

function ConversationScreen({
    conversation,
    messages,
}: {
    conversation: Conversation;
    messages: IMessage[];
}) {
    const [loggedInUser, _loading, _error] = useAuthState(auth);
    const conversationUses = conversation.users;
    const { recipient, recipientEmail } = useRecipient(conversationUses);
    const router = useRouter();
    const conversationId = router.query.id;
    const queryGetMessages = genarateQueryGetMessages(conversationId as string);
    const [messagesSnapshot, messagesLoading, __error] = useCollection(queryGetMessages);
    const [newMessage, setNewMessage] = useState('');
    const showMessages = () => {
        if (messagesLoading) {
            return messages.map((message) => <Message key={message.id} message={message} />);
        }

        if (messagesSnapshot) {
            return messagesSnapshot.docs.map((message) => (
                <Message key={message.id} message={transformMessage(message)} />
            ));
        }
        return null;
    };
    const addMessageToDbAndUpdateLastSeen = async () => {
        await setDoc(
            doc(db, 'users', loggedInUser?.email as string),
            {
                lastSeen: serverTimestamp(),
            },
            { merge: true }
        );
        await addDoc(collection(db, 'messages'), {
            conversation_id: conversationId,
            sendAt: serverTimestamp(),
            text: newMessage,
            user: loggedInUser?.email,
        });
        setNewMessage('');
    };
    const sendMessageOnEnter: KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!newMessage) return;
            addMessageToDbAndUpdateLastSeen();
            scrollToBottom();
        }
    };
    const onClickSendBtn: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        if (!newMessage) return;
        addMessageToDbAndUpdateLastSeen();
        scrollToBottom();
    };
    const endOfMessageRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        endOfMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <>
            <StyledRecipientHeader>
                <RecipientAvatar recipient={recipient} recipientEmail={recipientEmail} />
                <StyledHeaderInfo>
                    <StyledH3>{recipientEmail}</StyledH3>
                    {recipient && (
                        <span>Last active: {convertFireTimestampToString(recipient.lastSeen)}</span>
                    )}
                </StyledHeaderInfo>
                <StyledHeaderIcon>
                    <IconButton>
                        <AttachFile />
                    </IconButton>
                    <IconButton>
                        <MoreVert />
                    </IconButton>
                </StyledHeaderIcon>
            </StyledRecipientHeader>
            <StyledMessageContainer>
                {showMessages()}
                {/* for srcoll to the lastest message */}
                <EndOfMessageForAutoScroll ref={endOfMessageRef} />
            </StyledMessageContainer>
            <StyledInputContainer>
                <IconButton>
                    <InsertEmoticon />
                </IconButton>
                <StyledInput
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => sendMessageOnEnter(e)}
                />
                <IconButton onClick={onClickSendBtn} disabled={!newMessage}>
                    <Send />
                </IconButton>
                <IconButton>
                    <Mic />
                </IconButton>
            </StyledInputContainer>
        </>
    );
}

export default ConversationScreen;
