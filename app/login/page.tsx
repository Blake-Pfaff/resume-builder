"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [signupNotice, setSignupNotice] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const authRedirectUrl = typeof window === "undefined" ? "/dashboard" : `${window.location.origin}/dashboard`;

  const getAuthValues = () => {
    const form = formRef.current;
    const emailFromForm = (form?.elements.namedItem("email") as HTMLInputElement | null)?.value ?? "";
    const passwordFromForm = (form?.elements.namedItem("password") as HTMLInputElement | null)?.value ?? "";
    return {
      emailValue: emailFromForm.trim() || email.trim(),
      passwordValue: passwordFromForm || password,
    };
  };

  const onPasswordLogin = async () => {
    setSignupNotice(null);
    const { emailValue, passwordValue } = getAuthValues();

    if (!emailValue || !passwordValue) {
      toast.error("Enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: emailValue, password: passwordValue });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async () => {
    setSignupNotice(null);
    const { emailValue, passwordValue } = getAuthValues();
    if (!emailValue || !passwordValue) {
      toast.error("Enter both email and password.");
      return;
    }

    if (passwordValue.length < 3) {
      toast.error("Password must be at least 3 characters.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: emailValue,
        password: passwordValue,
        options: {
          emailRedirectTo: authRedirectUrl,
        },
      });
      if (error) throw error;

      if (data.session) {
        toast.success("Account created.");
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setSignupNotice("Account created. Check your email for a confirmation link before signing in.");
      toast.success("Account created. Check your email to confirm your account.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed";
      if (/already registered/i.test(message)) {
        toast.error("That email is already registered. Try logging in instead.");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const onMagicLink = async () => {
    setSignupNotice(null);
    const { emailValue } = getAuthValues();
    if (!emailValue) {
      toast.error("Enter an email address.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: emailValue,
        options: {
          emailRedirectTo: authRedirectUrl,
        },
      });
      if (error) throw error;
      toast.success("Magic link sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send magic link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Resume Generator</CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Sign in with email/password or use a magic link."
              : "Create an account with email/password, or use a magic link."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            ref={formRef}
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (mode === "signup") {
                void onSignup();
                return;
              }
              void onPasswordLogin();
            }}
          >
            <Input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {mode === "login" ? "Login" : "Create Account"}
              </Button>
              <Button type="button" variant="outline" disabled={loading} onClick={() => void onMagicLink()}>
                Send Magic Link
              </Button>
            </div>
            {signupNotice ? (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {signupNotice}
              </p>
            ) : null}
            <div className="text-sm text-zinc-600">
              {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="font-medium text-zinc-900 underline-offset-4 hover:underline"
                onClick={() => {
                  setSignupNotice(null);
                  setMode((prev) => (prev === "login" ? "signup" : "login"));
                }}
              >
                {mode === "login" ? "Sign up" : "Log in"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
