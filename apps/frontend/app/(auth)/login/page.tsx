import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-lg text-[15px] font-bold text-white">
          S
        </div>
        <span className="text-lg font-semibold tracking-tight">Syntra</span>
      </div>

      <div>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">
          Welcome back
        </h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Sign in to your Syntra workspace.
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-[13px] text-muted-foreground">
        {"Don't have an account? "}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}
