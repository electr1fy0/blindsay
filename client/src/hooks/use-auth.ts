import { checkEmail, signin, signup, verifyCode } from "@/api/auth";
import type { AuthCredentials, VerifyCodeRequest } from "@/types";
import { useMutation } from "@tanstack/react-query";

export function useCheckEmail() {
  return useMutation({
    mutationFn: checkEmail,
  });
}

export function useVerifyCode() {
  return useMutation({
    mutationFn: (request: VerifyCodeRequest) => verifyCode(request),
  });
}

export function useSignin() {
  return useMutation({
    mutationFn: (credentials: AuthCredentials) => signin(credentials),
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (credentials: AuthCredentials) => signup(credentials),
  });
}
