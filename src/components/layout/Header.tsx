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
    console.log("Attempting to log out from Header...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error (Header):", error);
      toast.error(`Gagal logout: ${error.message}`);
    } else {
      console.log("Logout successful (Header), SessionProvider should handle redirect.");
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
    { name: "FAQ", href: "/faq" }, // Menambahkan kembali item FAQ
  ];

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50 w-full">
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
              <span className="text-lg font-bold">JIMEKA</span> {/* Always show JIMEKA */}
              {/* Show on mobile, hide on small screens and up */}
              <span className="text-[0.6rem] leading-tight block sm:hidden">FAKULTAS EKONOMI DAN BISNIS UNIVERSITAS PERCOBAAN NANDA</span>
              <span className="text-[0.6rem] leading-tight block sm:hidden">E-ISSN: 2581-1002</span>
              {/* Show on small screens and up */}
              <span className="text-xs hidden sm:block">FAKULTAS EKONOMI DAN BISNIS UNIVERSITAS PERCOBAAN NANDA</span>
            </div>
          </Link>
          <span className="text-sm ml-2 hidden md:block">E-ISSN: 2581-1002</span>
        </div>
        {/* Right-aligned items for desktop and mobile */}
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex flex-wrap justify-end gap-1"> {/* Desktop nav, reduced gap */}
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