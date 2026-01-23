export interface Question {
  id?: string;
  content: string;
}

export interface Reply {
  id?: string;
  content: string;
  questionId: string;
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
