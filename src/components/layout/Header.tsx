"use client";

import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { MobileNav } from "./MobileNav";
import { useSupabase } from "@/components/SessionProvider";
import { toast } from "sonner";
import { MobileHeaderNav } from "./MobileHeaderNav";

export function Header() {
  const pathname = usePathname();
  const { supabase, session, profile } = useSupabase();

  const handleLogout = async () => {
    console.log("Attempting to log out from Header...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error (Header):", error);
      toast.error(`Gagal logout: ${error.message}`);
    } else {
      console.log("Logout successful (Header), SessionProvider should handle redirect.");
    }
  };

  const baseNavItems = [
    { name: "HOME", href: "/" },
    { name: "ABOUT", href: "/about" },
    { name: "SEARCH", href: "/search" },
    { name: "CURRENT", href: "/current" },
    { name: "ARCHIVES", href: "/archives" },
    { name: "ANNOUNCEMENTS", href: "/announcements" },
    { name: "FAQ", href: "/faq" },
  ];

  // Filter navItems based on user role for desktop header
  const desktopNavItems = profile?.role === 'admin'
    ? baseNavItems.filter(item => item.name !== "FAQ")
    : baseNavItems;

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50 w-full">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left side: MobileNav, Logo, Journal Info, and E-ISSN */}
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/jimeka-logo.png"
              alt="Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA) Logo Universitas Percobaan Nanda"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-base font-bold">JIMEKA</span> {/* Reduced from text-lg */}
              <span className="text-[0.55rem] leading-tight sm:text-[0.65rem] whitespace-nowrap">FAKULTAS EKONOMI DAN BISNIS UNIVERSITAS PERCOBAAN NANDA</span> {/* Adjusted font size */}
              {/* E-ISSN moved here, with margin-top and margin-left for indentation */}
              <span className="hidden md:block text-[0.55rem] leading-tight sm:text-[0.65rem] text-primary-foreground/80 whitespace-nowrap mt-1 ml-2">E-ISSN: 2581-1002</span> {/* Adjusted font size */}
            </div>
          </Link>
        </div>

        {/* Right side: Desktop Nav, User Actions, Mode Toggle */}
        <div className="hidden md:flex items-center gap-x-4 ml-auto"> {/* ml-auto pushes this group to the far right */}
          {/* Desktop Main Navigation */}
          <nav className="flex items-center gap-x-2"> {/* Tighter spacing for nav items */}
            {desktopNavItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                asChild
                className={`text-sm text-primary-foreground hover:bg-primary-foreground/10 ${ // Reduced from default button size
                  pathname === item.href ? "font-bold underline" : ""
                }`}
              >
                <Link href={item.href}>{item.name}</Link>
              </Button>
            ))}
          </nav>

          {/* Desktop User/Auth Actions */}
          <div className="flex items-center gap-x-2"> {/* Tighter spacing for auth buttons */}
            {session ? (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className={`text-sm text-primary-foreground hover:bg-primary-foreground/10 ${ // Reduced from default button size
                    pathname === "/profile" ? "font-bold underline" : ""
                  }`}
                >
                  <Link href="/profile">PROFILE</Link>
                </Button>
                {profile?.role === 'admin' && (
                  <Button
                    variant="ghost"
                    asChild
                    className={`text-sm text-primary-foreground hover:bg-primary-foreground/10 ${ // Reduced from default button size
                      pathname === "/admin" ? "font-bold underline" : ""
                    }`}
                  >
                    <Link href="/admin">ADMIN</Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="text-sm text-primary-foreground hover:bg-primary-foreground/10" // Reduced from default button size
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
                  className={`text-sm text-primary-foreground hover:bg-primary-foreground/10 ${ // Reduced from default button size
                    pathname === "/login" ? "font-bold underline" : ""
                  }`}
                >
                  <Link href="/login">LOGIN</Link>
                </Button>
                <Button
                  variant="ghost"
                  asChild
                  className={`text-sm text-primary-foreground hover:bg-primary-foreground/10 ${ // Reduced from default button size
                    pathname === "/register" ? "font-bold underline" : ""
                  }`}
                >
                  <Link href="/register">REGISTER</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mode Toggle */}
          <ModeToggle className="hidden md:block ml-4" />
        </div>

        {/* Mobile Header Nav (only visible on mobile, pushed to far right) */}
        <MobileHeaderNav navItems={baseNavItems} session={session} handleLogout={handleLogout} />
      </div>
    </header>
  );
}