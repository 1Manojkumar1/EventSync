"use client";

import { useAuth } from "@/context/auth-context";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
      <div className="w-full flex-1">
        <h1 className="text-lg font-semibold">
          {user ? `Welcome back, ${user.name}` : 'Campus Events'}
        </h1>
      </div>
    </header>
  );
}
