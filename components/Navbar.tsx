// components/Navbar.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { useAppStore } from "../lib/store";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const router = useRouter();
  const { userEmail, logout, toggleSidebar, isSidebarOpen } = useAppStore();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    router.push("/login");
  };

  const avatarInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  return (
    <nav className="p-4 shadow">
      <div
        className={cn(
          "container mx-auto flex items-center",
          isSidebarOpen ? "justify-end" : "justify-between"
        )}
      >
        {/* Hamburger for mobile when sidebar is closed */}
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-800"
            onClick={toggleSidebar}
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="User profile">
              <Avatar className="h-10 w-10 border border-gray-200 rounded-full">
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  {avatarInitial}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-lg shadow-md"
          >
            <DropdownMenuItem disabled className="text-muted-foreground">
              {userEmail || "User"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/profile")}
              className="cursor-pointer hover:bg-blue-100"
              disabled
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/settings")}
              className="cursor-pointer hover:bg-blue-100"
              disabled
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer hover:bg-red-100 text-red-800"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
