import { collection, query, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { auth, db } from '../configs/firebase';
import { AppUser, Conversation } from '../types';
import { getRecipientEmail } from '../utils/getRecipientEmail';

export const useRecipient = (conversationUser: Conversation['users']) => {
    const [loggedInUser, _loading, _error] = useAuthState(auth);
    const recipientEmail = getRecipientEmail(conversationUser, loggedInUser);
    const queryGetRecipient = query(collection(db, 'users'), where('email', '==', recipientEmail));
    const [recipientsSnapshot, __loading, __error] = useCollection(queryGetRecipient);
    const recipient = recipientsSnapshot?.docs[0]?.data() as AppUser | undefined;

    return {
        recipient,
        recipientEmail,
    };
};
