"use client";

import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { MobileNav } from "./MobileNav";
import { useSupabase } from "@/components/SessionProvider";
import { MobileHeaderNav } from "./MobileHeaderNav";
import { UnifiedWalletButtonWrapper as UnifiedWalletButton } from "@/components/wallet/UnifiedWalletButtonWrapper";
import { useLogout } from "@/hooks/useLogout";

export function Header() {
  const pathname = usePathname();
  const { session, profile } = useSupabase();
  const { logout } = useLogout();

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
  const desktopNavItems =
    profile?.role === "admin"
      ? baseNavItems.filter((item) => item.name !== "FAQ")
      : baseNavItems;

  return (
    <header className="bg-primary text-primary-foreground py-2 px-3 shadow-md sticky top-0 z-50 w-full">
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* Left Group: MobileNav, Logo, Journal Info, and E-ISSN */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <Image
              src="/jimeka-logo.png"
              alt="Jurnal Ekonomi Bisnis dan Akuntansi Mahasiswa (JEBAKA) Logo Universitas Percobaan Nanda"
              width={32}
              height={32}
              className="rounded-full flex-shrink-0"
              priority
              sizes="32px"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-sm font-bold text-white">JEBAKA</span>
                <span className="text-[10px] md:text-[11px] leading-tight text-primary-foreground/80 whitespace-nowrap">
                  E-ISSN: 1234-5678
                </span>
              </div>
              <span className="text-[10px] md:text-[11px] leading-tight text-primary-foreground/90">
                <span className="block md:hidden">
                  FAKULTAS EKONOMI DAN BISNIS
                  <br />
                  UNIVERSITAS PERCOBAAN NANDA
                </span>
                <span className="hidden md:block truncate">
                  FAKULTAS EKONOMI DAN BISNIS UNIVERSITAS PERCOBAAN NANDA
                </span>
              </span>
            </div>
          </Link>
        </div>

        {/* Right Group: Desktop Nav, Crypto Wallet, User Actions, Mode Toggle */}
        <div className="hidden md:flex items-center gap-x-1 lg:gap-x-2 flex-shrink-0">
          {/* Desktop Main Navigation */}
          <nav className="flex items-center gap-x-0.5 lg:gap-x-1">
            {desktopNavItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                asChild
                className={`text-[10px] lg:text-xs text-primary-foreground hover:bg-primary-foreground/10 transition-colors px-1.5 lg:px-2 h-8 ${
                  pathname === item.href
                    ? "font-bold bg-primary-foreground/10"
                    : ""
                }`}
              >
                <Link href={item.href}>{item.name}</Link>
              </Button>
            ))}
          </nav>

          {/* Separator */}
          <div className="h-5 w-px bg-white/30 mx-1"></div>

          {/* Wallet Connection */}
          <div className="flex items-center">
            <UnifiedWalletButton
              variant="outline"
              size="sm"
              className="header-wallet text-[10px] lg:text-xs"
            />
          </div>

          {/* Separator */}
          <div className="h-5 w-px bg-white/30 mx-1"></div>

          {/* Desktop User/Auth Actions */}
          <div className="flex items-center gap-x-0.5 lg:gap-x-1">
            {session ? (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className={`text-[10px] lg:text-xs text-primary-foreground hover:bg-primary-foreground/10 px-1.5 lg:px-2 h-8 ${
                    pathname === "/profile"
                      ? "font-bold bg-primary-foreground/10"
                      : ""
                  }`}
                >
                  <Link href="/profile">PROFILE</Link>
                </Button>
                {profile?.role === "admin" && (
                  <Button
                    variant="ghost"
                    asChild
                    className={`text-[10px] lg:text-xs text-primary-foreground hover:bg-primary-foreground/10 px-1.5 lg:px-2 h-8 ${
                      pathname === "/admin"
                        ? "font-bold bg-primary-foreground/10"
                        : ""
                    }`}
                  >
                    <Link href="/admin">ADMIN</Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="text-[10px] lg:text-xs text-primary-foreground hover:bg-primary-foreground/10 px-1.5 lg:px-2 h-8"
                  onClick={logout}
                >
                  LOGOUT
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className={`text-[10px] lg:text-xs text-primary-foreground hover:bg-primary-foreground/10 px-1.5 lg:px-2 h-8 ${
                    pathname === "/login"
                      ? "font-bold bg-primary-foreground/10"
                      : ""
                  }`}
                >
                  <Link href="/login">LOGIN</Link>
                </Button>
                <Button
                  variant="ghost"
                  asChild
                  className={`text-[10px] lg:text-xs text-primary-foreground hover:bg-primary-foreground/10 px-1.5 lg:px-2 h-8 ${
                    pathname === "/register"
                      ? "font-bold bg-primary-foreground/10"
                      : ""
                  }`}
                >
                  <Link href="/register">REGISTER</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mode Toggle */}
          <div className="ml-1">
            <ModeToggle />
          </div>
        </div>

        {/* Mobile Header Nav (only visible on mobile, pushed to far right) */}
        <MobileHeaderNav
          navItems={baseNavItems}
          session={session}
          handleLogout={logout}
        />
      </div>
    </header>
  );
}
