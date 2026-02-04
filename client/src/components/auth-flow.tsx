import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  useEmailSubmit,
  useSignin,
  useSignup,
  useVerifyEmail,
} from "@/hooks/use-auth";
import { Spinner } from "./ui/spinner";

type AuthState =
  | "email"
  | "login"
  | "verify"
  | "password-setup"
  | "password-confirm"
  | "profile-setup"
  | "done";

export function AuthFlow() {
  const [step, setStep] = useState<AuthState>("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: verifyEmail, isPending: isEmailVerifyPending } =
    useVerifyEmail();
  const { mutate: submitEmail, isPending: isEmailSubmitPending } =
    useEmailSubmit();
  const { mutate: signin, isPending: isSigninPending } = useSignin();
  const { mutate: signup, isPending: isSignupPending } = useSignup();

  const handleSubmit = (e: React.SubmitEvent) => {
    switch (step) {
      case "email":
        handleEmailSubmit(e);
        break;
      case "verify":
        handleVerifyEmail(e);
        break;
      case "login":
        handleLoginSubmit(e);
        break;
      case "password-setup":
        handlePasswordSetupSubmit(e);
        break;
      case "password-confirm":
        handlePasswordConfirmSubmit(e);
        break;
    }
  };

  const handleEmailSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    submitEmail(email, {
      onSuccess: () => {
        setStep("verify");
      },
      onError: (err) => {
        setError(err.message);
      },
    });
  };

  const handleVerifyEmail = (e: React.SubmitEvent) => {
    e.preventDefault();
    verifyEmail({ email: email, code: code });
    setError("");
    setStep("password-setup");
  };

  const handlePasswordSetupSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setStep("password-confirm");
  };

  const handlePasswordConfirmSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    // setStep("profile-setup");
    handleSignupSubmit(e);
  };

  const handleSignupSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    signup(
      { email, password },
      {
        onSuccess: () => setStep("done"),
        onError: (err) => setError(err.message),
      },
    );

    setIsLoading(false);
  };

  const handleLoginSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    setError("");
    try {
      const res = await fetch("http://localhost:8080/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sign in");

      setStep("done");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "done") {
    return (
      <Card className="w-full max-w-md mx-auto mt-10">
        <CardContent className="pt-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
          <p>You have successfully authenticated.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div className="w-full max-w-md mx-auto mt-10 ">
      <img src="/unsaid.png" className="size-14 mx-auto my-4"></img>
      <h2 className="text-center text-lg">
        {step === "email" && "Welcome to Unsaid"}
        {step === "login" && "Welcome Back"}
        {step === "verify" && "Verify Email"}
        {step === "password-setup" && "Set Password"}
        {step === "password-confirm" && "Confirm Password"}
        {step === "profile-setup" && "Profile Setup"}
      </h2>
      <h3 className="text-neutral-500 text-center">
        {step === "email" && "Login or Signup to get started."}
        {step === "login" && `Enter password for ${email}`}
        {step === "verify" && `Enter the code sent to ${email} (Mock: 123456)`}
        {step === "password-setup" && "Create a secure password"}
        {step === "password-confirm" && "Re-enter your password to confirm"}
        {step === "profile-setup" && "Choose a username"}
      </h3>
      <form onSubmit={handleSubmit}>
        <motion.div className="space-y-4">
          {step === "email" && (
            <Field className="mt-10 ">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className=" shadow-none border-none bg-neutral-100 h-11 rounded-xl text-base"
                autoFocus
              />
            </Field>
          )}
          {email == "" && (
            <motion.div
              key="help-text"
              className="text-sm text-neutral-400 text-center mx-auto overflow-hidden"
              initial={{ opacity: 0, height: 0, marginTop: 0, y: -10 }}
              animate={{
                opacity: 1,
                height: "auto",
                marginTop: 16,
                y: 0,
              }}
              exit={{ opacity: 0, height: 0, marginTop: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              We’ll create an account if you don’t have one yet.
            </motion.div>
          )}
          {step === "login" && (
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </Field>
          )}

          {step === "verify" && (
            <Field>
              <FieldLabel>Verification Code</FieldLabel>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                autoFocus
              />
            </Field>
          )}

          {step === "password-setup" && (
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </Field>
          )}

          {step === "password-confirm" && (
            <Field>
              <FieldLabel>Confirm Password</FieldLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoFocus
              />
            </Field>
          )}

          {step === "profile-setup" && (
            <Field>
              <FieldLabel>Username</FieldLabel>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoFocus
              />
            </Field>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </motion.div>

        {(() => {
          let showButton = false;
          if (step === "email") showButton = email.length > 0;
          if (step === "login") showButton = password.length > 0;
          if (step === "verify") showButton = code.length > 0;
          if (step === "password-setup") showButton = password.length > 0;
          if (step === "password-confirm")
            showButton = confirmPassword.length > 0;
          if (step === "profile-setup") showButton = username.length > 0;

          return (
            showButton && (
              <motion.div
                key="continue-btn"
                className="mt-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl"
                  disabled={isLoading}
                >
                  {isEmailVerifyPending || isEmailSubmitPending ? (
                    <Spinner className="size-5"></Spinner>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </motion.div>
            )
          );
        })()}
      </form>
    </motion.div>
  );
}
