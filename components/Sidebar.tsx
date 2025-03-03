// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Boxes, Menu } from "lucide-react"; // Added more icons for weihu links
import { useAppStore } from "../lib/store";
import { useEffect } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useAppStore();

  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768; // md: breakpoint
      setSidebarOpen(isDesktop);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarOpen]);

  return (
    <>
      {/* Sidebar with Glassmorphism */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 w-64 backdrop-blur-md text-gray-800 shadow-xl transform",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-40"
        )}
      >
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-800 md:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center space-x-3 p-2 rounded-lg transition-colors",
                  pathname === "/dashboard"
                    ? "bg-blue-100"
                    : "hover:bg-blue-100"
                )}
                onClick={() => toggleSidebar()}
              >
                <Home className="h-5 w-5 text-blue-500" />
                <span className="text-base font-medium">Dashboard</span>
              </Link>
            </li>

            <li>
              <Link
                href="/dashboard/products"
                className={cn(
                  "flex items-center space-x-3 p-2 rounded-lg transition-colors",
                  pathname === "/dashboard/products"
                    ? "bg-blue-100"
                    : "hover:bg-blue-100"
                )}
                onClick={() => toggleSidebar()}
              >
                <Boxes className="h-5 w-5 text-blue-500" />
                <span className="text-base font-medium">Products</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
