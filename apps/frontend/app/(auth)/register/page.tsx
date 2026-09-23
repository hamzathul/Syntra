import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center lg:hidden">
        <div className="brand-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-[0_8px_20px_-6px_hsl(var(--primary)/0.6)]">
          S
        </div>
      </div>
      <div className="text-center lg:text-left">
        <h1 className="text-[28px] font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started with Syntra — free, no card needed
        </p>
      </div>

      <Card className="p-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-[17px]">Register</CardTitle>
          <CardDescription>Fill in your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
