export interface Message {
    id: number;
    recipientId: number;
    content: string;
    reply?: string;
}

export interface CreateReplyRequest {
    messageId: number;
    content: string;
}
