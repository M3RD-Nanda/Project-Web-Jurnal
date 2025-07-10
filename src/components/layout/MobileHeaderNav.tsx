"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Session } from "@supabase/supabase-js";
import { useSupabase } from "@/components/SessionProvider";

interface MobileHeaderNavProps {
  navItems: { name: string; href: string }[];
  session: Session | null;
  handleLogout: () => void;
}

export function MobileHeaderNav({ navItems, session, handleLogout }: MobileHeaderNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { profile } = useSupabase();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle header navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64 p-0 bg-sidebar text-sidebar-foreground border-l border-sidebar-border flex flex-col">
        <SheetHeader className="p-4 border-b border-sidebar-border flex flex-row items-center gap-x-2">
          <SheetTitle className="text-lg font-semibold text-sidebar-primary">Navigasi</SheetTitle>
          <ModeToggle />
        </SheetHeader>
        <nav className="flex flex-col p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              asChild
              className={cn(
                "w-full justify-start text-left transition-colors duration-200 text-sm", // Changed text-base to text-sm
                "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === item.href
                  ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                  : ""
              )}
              onClick={() => setIsOpen(false)}
            >
              <Link href={item.href}>{item.name}</Link>
            </Button>
          ))}
          {/* Add Rating Web link here for mobile header nav */}
          <Button
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start text-left transition-colors duration-200 text-sm", // Changed text-base to text-sm
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              pathname === "/ratings"
                ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                : ""
            )}
            onClick={() => setIsOpen(false)}
          >
            <Link href="/ratings">RATING WEB</Link>
          </Button>
          {session ? (
            <>
              <Button
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start text-left transition-colors duration-200 text-sm", // Changed text-base to text-sm
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  pathname === "/profile"
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                    : ""
                )}
                onClick={() => setIsOpen(false)}
              >
                <Link href="/profile">PROFILE</Link>
              </Button>
              {profile?.role === 'admin' && (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className={cn(
                      "w-full justify-start text-left transition-colors duration-200 text-sm", // Changed text-base to text-sm
                      "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      pathname === "/admin"
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                          : ""
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/admin">ADMIN</Link>
                  </Button>
                  <div className="border-t border-sidebar-border pt-3 mt-3 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground px-3">ADMIN MENU</p>
                    <Button
                      variant="ghost"
                      asChild
                      className={cn(
                        "w-full justify-start text-left transition-colors duration-200 text-sm", // Changed text-base to text-sm
                        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        pathname === "/admin/announcements"
                          ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                          : ""
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/admin/announcements">Kelola Pengumuman</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      asChild
                      className={cn(
                        "w-full justify-start text-left transition-colors duration-200 text-sm", // Changed text-base to text-sm
                        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        pathname === "/admin/articles"
                          ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                          : ""
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/admin/articles">Kelola Artikel</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      asChild
                      className={cn(
                        "w-full justify-start text-left transition-colors duration-200 text-sm", // Changed text-base to text-sm
                        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        pathname === "/admin/issues"
                          ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                          : ""
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/admin/issues">Kelola Edisi</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      asChild
                      className={cn(
                        "w-full justify-start text-left transition-colors duration-200 text-sm", // Changed text-base to text-sm
                        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        pathname === "/admin/users"
                          ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                          : ""
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/admin/users">Kelola Pengguna</Link>
                    </Button>
                  </div>
                </>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start text-left transition-colors duration-200 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" // Changed text-base to text-sm
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
              >
                LOGOUT
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start text-left transition-colors duration-200 text-sm", // Changed text-base to text-sm
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  pathname === "/login"
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                    : ""
                )}
                onClick={() => setIsOpen(false)}
              >
                <Link href="/login">LOGIN</Link>
              </Button>
              <Button
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start text-left transition-colors duration-200 text-sm", // Changed text-base to text-sm
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  pathname === "/register"
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                    : ""
                )}
                onClick={() => setIsOpen(false)}
              >
                <Link href="/register">REGISTER</Link>
              </Button>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}