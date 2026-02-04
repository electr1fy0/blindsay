import { signin, signup, submitEmail, verifyEmail } from "@/api/auth";
import { useQuery, useMutation } from "@tanstack/react-query";

export function useEmailSubmit() {
  return useMutation({
    mutationFn: submitEmail,
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: verifyEmail,
  });
}

export function useSignin() {
  return useMutation({
    mutationFn: signin,
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: signup,
  });
}
