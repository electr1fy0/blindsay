import { useState } from "react";
import { Navigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  useCheckEmail,
  useSignin,
  useSignup,
  useVerifyCode,
} from "@/hooks/use-auth";
import { Spinner } from "./ui/spinner";
import {
  LockPasswordIcon,
  Mail02Icon,
  PulseRectangle01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import HelpText from "./help-text";
import { AuthLayout } from "./auth-layout";

type AuthState =
  | "email"
  | "login"
  | "verify"
  | "password-setup"
  | "password-confirm"
  | "profile-setup"
  | "done";

const STEP_CONFIG = {
  email: {
    title: "Welcome to Unsaid",
    subtitle: "Login or Signup to get started.",
    icon: PulseRectangle01Icon,
  },
  login: {
    title: "Enter Password",
    subtitle: "Please enter your custom account password.",
    icon: LockPasswordIcon,
  },
  verify: {
    title: "Verify Email",
    subtitle: "Enter the code sent to your email",
    icon: Mail02Icon,
  },
  "password-setup": {
    title: "Set Password",
    subtitle: "Create a secure password",
    icon: LockPasswordIcon,
  },
  "password-confirm": {
    title: "Confirm Password",
    subtitle: "Re-enter your password to confirm",
    icon: LockPasswordIcon,
  },
  "profile-setup": {
    title: "Profile Setup",
    subtitle: "Choose a username",
    icon: UserIcon,
  },
} as const;

export function AuthFlow() {
  const [step, setStep] = useState<AuthState>("email");
  const [apiError, setApiError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");

  const { mutate: verifyCode, isPending: isVerifyPending } = useVerifyCode();
  const { mutate: checkEmail, isPending: isCheckEmailPending } =
    useCheckEmail();
  const { mutate: signin, isPending: isSigninPending } = useSignin();
  const { mutate: signup, isPending: isSignupPending } = useSignup();

  const isLoading =
    isVerifyPending ||
    isCheckEmailPending ||
    isSigninPending ||
    isSignupPending;

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setApiError("");

    if (step === "email") {
      if (!email) return;
      checkEmail(email, {
        onSuccess: (exists) => {
          setStep(exists ? "login" : "verify");
          setPassword("");
          setCode("");
        },
        onError: (err) => setApiError(err.message),
      });
    } else if (step === "verify") {
      if (!code) return;
      verifyCode(
        { email, code },
        {
          onSuccess: () => {
            setStep("password-setup");
            setPassword("");
          },
          onError: () => setApiError("Invalid code"),
        },
      );
    } else if (step === "login") {
      if (!password) return;
      signin(
        { email, password },
        {
          onSuccess: () => setStep("done"),
          onError: (err) => setApiError(err.message),
        },
      );
    } else if (step === "password-setup") {
      if (password.length < 8) return;
      setStep("password-confirm");
      setConfirmPassword("");
    } else if (step === "password-confirm") {
      if (!confirmPassword) return;
      if (password !== confirmPassword) {
        setApiError("Passwords do not match");
        return;
      }
      setStep("profile-setup");
      setUsername("");
    } else if (step === "profile-setup") {
      if (!username || username.length < 3) return;
      signup(
        { email, password, username },
        {
          onSuccess: () => setStep("done"),
          onError: (err) => setApiError(err.message),
        },
      );
    }
  };

  const isStepValid = () => {
    if (step === "email") return !!email;
    if (step === "login") return !!password;
    if (step === "verify") return !!code;
    if (step === "password-setup") return password.length >= 8;
    if (step === "password-confirm") return !!confirmPassword;
    if (step === "profile-setup") return username.length >= 3;
    return true;
  };

  if (step === "done") return <Navigate to="/ayush" />;

  const config = STEP_CONFIG[step as keyof typeof STEP_CONFIG];
  const { title, subtitle, icon } = config || STEP_CONFIG.email;

  return (
    <AuthLayout title={title} subtitle={subtitle} icon={icon}>
      <form onSubmit={handleSubmit}>
        {step === "email" && (
          <>
            <Field className="mt-10">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="shadow-none border-none bg-neutral-100 h-11 rounded-xl text-base"
                autoFocus
              />
            </Field>
            {!email && (
              <HelpText
                type="info"
                content="We'll create an account if you don't have one yet."
              />
            )}
          </>
        )}

        {step === "login" && (
          <>
            <Field className="mt-10">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="shadow-none border-none bg-neutral-100 h-11 rounded-xl text-base"
                autoFocus
              />
            </Field>
            {!password && (
              <HelpText
                type="info"
                content="Forgot your password?"
                linkStr=" Use a Recovery Code"
                linkUrl="/recovery"
              />
            )}
          </>
        )}

        {step === "verify" && (
          <Field className="mt-10">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              autoFocus
              className="shadow-none border-none bg-neutral-100 h-11 rounded-xl text-base"
            />
          </Field>
        )}

        {step === "password-setup" && (
          <Field className="mt-10">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow-none border-none bg-neutral-100 h-11 rounded-xl text-base"
              autoFocus
              placeholder="Password"
            />
          </Field>
        )}

        {step === "password-confirm" && (
          <div className="space-y-4 mt-10">
            {apiError === "Passwords do not match" && (
              <Field>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="shadow-none border-none bg-neutral-100 h-11 rounded-xl text-base"
                  placeholder="Password"
                />
              </Field>
            )}
            <Field>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="shadow-none border-none bg-neutral-100 h-11 rounded-xl text-base"
                autoFocus
                placeholder="Confirm Password"
              />
            </Field>
          </div>
        )}

        {step === "profile-setup" && (
          <Field className="mt-10">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="shadow-none border-none bg-neutral-100 h-11 rounded-xl text-base"
              autoFocus
            />
          </Field>
        )}

        {apiError && <HelpText type="error" content={apiError} />}

        {isStepValid() && (
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
              {isLoading ? <Spinner className="size-5" /> : "Continue"}
            </Button>
          </motion.div>
        )}
      </form>
    </AuthLayout>
  );
}
