import {
    collection,
    DocumentData,
    orderBy,
    query,
    QueryDocumentSnapshot,
    Timestamp,
    where,
} from 'firebase/firestore';
import { db } from '../configs/firebase';
import { IMessage } from '../types';

export const genarateQueryGetMessages = (conversationId?: string) =>
    query(
        collection(db, 'messages'),
        where('conversation_id', '==', conversationId),
        orderBy('sendAt', 'asc')
    );

export const transformMessage = (messageDoc: QueryDocumentSnapshot<DocumentData>) => {
    return {
        id: messageDoc.id,
        ...messageDoc.data(),
        sendAt: messageDoc.data().sendAt
            ? convertFireTimestampToString(messageDoc.data().sendAt as Timestamp)
            : null,
    } as IMessage;
};

export const convertFireTimestampToString = (timestamp: Timestamp) => {
    return new Date(timestamp.toDate().getTime()).toLocaleString();
};
