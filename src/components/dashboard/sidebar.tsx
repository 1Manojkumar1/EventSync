"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import {
  Calendar,
  Users,
  PlusCircle,
  List,
  LayoutDashboard,
  LogOut,
  Bell,
  UserCheck,
  Settings,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const links = [
    {
      href: "/events",
      label: "All Events",
      icon: Calendar,
      roles: ["admin", "coordinator", "participant"],
    },
    {
      href: "/admin",
      label: "Admin Dashboard",
      icon: LayoutDashboard,
      roles: ["admin"],
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
      roles: ["admin", "coordinator"],
    },
    {
      href: "/admin/users",
      label: "Manage Users",
      icon: Users,
      roles: ["admin"],
    },
    {
      href: "/coordinator/create",
      label: "Create Event",
      icon: PlusCircle,
      roles: ["coordinator"],
    },
    {
      href: "/coordinator/my-events",
      label: "My Events",
      icon: List,
      roles: ["coordinator"],
    },
    {
      href: "/coordinator/volunteers",
      label: "Volunteer Polls",
      icon: UserCheck,
      roles: ["coordinator", "admin"],
    },
    {
      href: "/my-registrations",
      label: "My Registrations",
      icon: List,
      roles: ["participant"],
    },
    {
      href: "/volunteer-inbox",
      label: "Volunteer Inbox",
      icon: Bell,
      roles: ["admin", "coordinator", "participant"],
      badge: user.isVolunteer ? true : false,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      roles: ["admin", "coordinator", "participant"],
    }
  ];

  const filteredLinks = links.filter(link => link.roles.includes(user.role));

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card text-card-foreground">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Calendar className="h-6 w-6 text-primary" />
          <span>CampusEvents</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {filteredLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={index}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group text-sm font-medium",
                  pathname === link.href
                    ? "bg-accent/10 text-accent shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 transition-transform group-hover:scale-110",
                  pathname === link.href ? "text-accent" : ""
                )} />
                <span className="flex-1">{link.label}</span>
                {link.badge && (
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(var(--accent),0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="text-sm">
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
