export interface CheckEmailRequest {
  email: string;
}

export interface CheckEmailResponse {
  exists: boolean;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  username?: string;
}
