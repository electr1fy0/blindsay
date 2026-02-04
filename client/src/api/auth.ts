export async function submitEmail(email: string): Promise<boolean> {
  const res = await fetch("http://localhost:8080/auth/check-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to check email");

  return data.exists;
}

type VerifyPayload = {
  email: string;
  code: string;
};

export async function verifyEmail({ email, code }: VerifyPayload) {
  const res = await fetch("http://localhost:8080/auth/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to verify code");

  return res.ok;
}

type AuthPayload = {
  email: string;
  password: string;
};

export async function signup({ email, password }: AuthPayload) {
  const res = await fetch("http://localhost:8080/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("failed to signup", await res.json());
}

export async function signin({ email, password }: AuthPayload) {
  const res = await fetch("http://localhost:8080/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("failed to signin", await res.json());
}
