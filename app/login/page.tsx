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
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

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

  const onMagicLink = async () => {
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
          emailRedirectTo: `${window.location.origin}/dashboard`,
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
          <CardDescription>Sign in with email/password or use a magic link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            ref={formRef}
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
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
              Login
              </Button>
              <Button type="button" variant="outline" disabled={loading} onClick={() => void onMagicLink()}>
              Send Magic Link
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
