"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, getApiErrorMessage } from "@/lib/api/core-client";
import { companyApi } from "@/lib/api/erp-client";
import { setUser, setActiveCompany } from "@/lib/auth";

export function LoginForm() {
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    setPending(true);
    try {
      const response = await authApi.login({ email, password });
      const { user } = response.data.data;
      setUser(user);

      const companies = await companyApi.list();
      if (companies.length === 0) {
        toast.success("Welcome back! Please set up your company.");
        window.location.href = "/onboarding";
        return;
      }

      const defaultCompany = companies.find((c) => c.isDefault) ?? companies[0]!;
      setActiveCompany({ id: defaultCompany.id, name: defaultCompany.name, role: defaultCompany.role });

      toast.success("Welcome back!");
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          minLength={8}
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
