"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client/core-client";
import { useCompanies } from "@/hooks/companies/use-companies-query";
import { useAuth } from "@/lib/auth-context";

const loginFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const { login, isLoggingIn } = useAuth();
  const { data: companies = [], isLoading: isLoadingCompanies } =
    useCompanies();
  const [hasLoggedIn, setHasLoggedIn] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (hasLoggedIn && !isLoadingCompanies) {
      window.location.href =
        companies.length === 0 ? "/onboarding" : "/dashboard";
    }
  }, [hasLoggedIn, isLoadingCompanies, companies]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      setHasLoggedIn(true);
      toast.success("Welcome back!");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className="rounded-xl h-10"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          className="rounded-xl h-10"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-destructive mt-1">
            {errors.password.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full h-10 rounded-xl font-medium shadow-sm shadow-primary/20 mt-2"
        disabled={isLoggingIn}
      >
        {isLoggingIn ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}