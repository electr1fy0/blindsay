export interface Message {
  id?: number;
  recipientId?: number;
  content: string;
  reply?: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface SigninRequest {
  username: string;
  password: string;
}

export interface Reply {
  messageId: number;
  content: string;
}
