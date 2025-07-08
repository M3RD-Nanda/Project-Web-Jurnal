"use client";

import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation"; // Import usePathname

export function Header() {
  const pathname = usePathname(); // Get current pathname

  const navItems = [
    { name: "HOME", href: "/" },
    { name: "ABOUT", href: "/about" },
    { name: "LOGIN", href: "/login" },
    { name: "REGISTER", href: "/register" },
    { name: "SEARCH", href: "/search" },
    { name: "CURRENT", href: "/current" },
    { name: "ARCHIVES", href: "/archives" },
    { name: "ANNOUNCEMENTS", href: "/announcements" },
  ];

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/jimeka-logo.png" // Placeholder for your logo
              alt="JIMEKA Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold">JIMEKA</span>
              <span className="text-xs">FAKULTAS EKONOMI DAN BISNIS UNIVERSITAS SYIAH KUALA</span>
            </div>
          </Link>
          <span className="text-sm ml-4 hidden md:block">E-ISSN: 2581-1002</span>
        </div>
        <nav className="flex flex-wrap justify-center md:justify-end gap-2">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              asChild
              className={`text-primary-foreground hover:bg-primary-foreground/10 ${
                pathname === item.href ? "font-bold underline" : ""
              }`}
            >
              <Link href={item.href}>{item.name}</Link>
            </Button>
          ))}
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}