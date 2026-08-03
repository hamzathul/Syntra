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
        <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary/30">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {mounted && user ? getInitials(user.name) : ""}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
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
