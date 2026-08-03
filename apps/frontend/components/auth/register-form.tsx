"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { useAuth } from "@/lib/auth-context";

export function RegisterForm() {
  const { register, isRegistering } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await register({ name, email, password });
      toast.success("Account created! Let's set up your company.");
      window.location.href = "/onboarding";
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-medium">
          Full name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Jane Smith"
          required
          autoComplete="name"
          minLength={2}
          className="rounded-xl h-10"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="rounded-xl h-10"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          minLength={8}
          className="rounded-xl h-10"
        />
      </div>
      <Button
        type="submit"
        className="w-full h-10 rounded-xl font-medium shadow-sm shadow-primary/20 mt-2"
        disabled={isRegistering}
      >
        {isRegistering ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
