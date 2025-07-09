"use client";

import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { MobileNav } from "./MobileNav";
import { useSupabase } from "@/components/SessionProvider"; // Import useSupabase hook
import { toast } from "sonner";
import { MobileHeaderNav } from "./MobileHeaderNav"; // Import the new MobileHeaderNav

export function Header() {
  const pathname = usePathname();
  const { supabase, session, profile } = useSupabase(); // Get profile from useSupabase

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Gagal logout: ${error.message}`);
    } else {
      // SessionProvider akan menangani redirect dan toast sukses
    }
  };

  const navItems = [
    { name: "HOME", href: "/" },
    { name: "ABOUT", href: "/about" },
    { name: "SEARCH", href: "/search" },
    { name: "CURRENT", href: "/current" },
    { name: "ARCHIVES", href: "/archives" },
    { name: "ANNOUNCEMENTS", href: "/announcements" },
  ];

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <MobileNav /> {/* Left mobile menu */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/jimeka-logo.png"
              alt="Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA) Logo Universitas Percobaan Nanda"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold hidden md:block">JIMEKA</span>
              <span className="text-lg font-bold block md:hidden">Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi</span>
              <span className="text-xs hidden sm:block">FAKULTAS EKONOMI DAN BISNIS UNIVERSITAS PERCOBAAN NANDA</span>
            </div>
          </Link>
          <span className="text-sm ml-4 hidden md:block">E-ISSN: 2581-1002</span>
        </div>
        {/* Right-aligned items for desktop and mobile */}
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex flex-wrap justify-end gap-2"> {/* Desktop nav */}
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
            {session ? (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className={`text-primary-foreground hover:bg-primary-foreground/10 ${
                    pathname === "/profile" ? "font-bold underline" : ""
                  }`}
                >
                  <Link href="/profile">PROFILE</Link>
                </Button>
                {profile?.role === 'admin' && (
                  <Button
                    variant="ghost"
                    asChild
                    className={`text-primary-foreground hover:bg-primary-foreground/10 ${
                      pathname === "/admin" ? "font-bold underline" : ""
                    }`}
                  >
                    <Link href="/admin">ADMIN</Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={handleLogout}
                >
                  LOGOUT
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className={`text-primary-foreground hover:bg-primary-foreground/10 ${
                    pathname === "/login" ? "font-bold underline" : ""
                  }`}
                >
                  <Link href="/login">LOGIN</Link>
                </Button>
                <Button
                  variant="ghost"
                  asChild
                  className={`text-primary-foreground hover:bg-primary-foreground/10 ${
                    pathname === "/register" ? "font-bold underline" : ""
                  }`}
                >
                  <Link href="/register">REGISTER</Link>
                </Button>
              </>
            )}
          </nav>
          <MobileHeaderNav navItems={navItems} session={session} handleLogout={handleLogout} /> {/* New right mobile menu */}
          <ModeToggle className="hidden md:block" /> {/* ModeToggle for desktop */}
        </div>
      </div>
    </header>
  );
}