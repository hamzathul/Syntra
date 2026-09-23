"use client";

import { useState, useEffect } from "react";
import { LogOut, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserNav() {
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-10 w-10 cursor-pointer p-[2px] ring-2 ring-primary/20 transition-all duration-200 hover:ring-primary/40 hover:scale-[1.03] active:scale-[0.98]">
          <AvatarFallback className="rounded-full bg-gradient-to-br from-primary/[0.16] to-primary/[0.06] text-primary text-xs font-bold">
            {mounted && user ? getInitials(user.name) : ""}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-60 rounded-2xl p-2" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-semibold">
              {mounted && user ? getInitials(user.name) : ""}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="truncate text-sm font-medium">
                {mounted && user ? user.name : ""}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {mounted && user ? user.email : ""}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="flex items-center gap-2 text-sm">
            <Moon className="h-4 w-4 text-muted-foreground" />
            Dark mode
          </span>
          <Switch
            aria-label="Toggle dark mode"
            checked={mounted ? isDark : false}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
