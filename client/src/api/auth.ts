import { apiRequest } from "@/lib/api-client";
import type {
  AuthCredentials,
  CheckEmailRequest,
  CheckEmailResponse,
  VerifyCodeRequest,
} from "@/types";

export async function checkEmail(email: string): Promise<boolean> {
  const payload: CheckEmailRequest = { email };
  const response = await apiRequest<CheckEmailResponse>(
    "/auth/check-email",
    { method: "POST", body: payload }
  );
  return response.exists;
}

export async function verifyCode(request: VerifyCodeRequest): Promise<void> {
  await apiRequest<void>("/auth/verify-code", {
    method: "POST",
    body: request,
  });
}

export async function signup(credentials: AuthCredentials): Promise<void> {
  await apiRequest<void>("/auth/signup", {
    method: "POST",
    body: credentials,
  });
}

export async function signin(credentials: AuthCredentials): Promise<void> {
  await apiRequest<void>("/auth/signin", {
    method: "POST",
    body: credentials,
  });
}
