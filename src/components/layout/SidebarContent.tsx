"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathname } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { toast } from "sonner";
import { AnalyticsMinimal } from "@/components/AnalyticsMinimal";
// import { AnalyticsDebug } from "@/components/AnalyticsDebug";

import { useSupabase } from "@/components/SessionProvider";
import { RatingDialog } from "@/components/RatingDialog";
import { useLogout } from "@/hooks/useLogout";

// const sidebarLoginFormSchema = z.object({
//   username: z.string().min(1, { message: "Nama pengguna tidak boleh kosong." }),
//   password: z
//     .string()
//     .min(6, { message: "Kata sandi harus minimal 6 karakter." }),
// });

const sidebarNavItems = [
  { name: "INCORPORATED WITH", href: "/incorporated" },
  { name: "EDITORIAL TEAM", href: "/editorial-team" },
  { name: "FOCUS AND SCOPE", href: "/focus-scope" },
  { name: "ABSTRACTING AND INDEXING", href: "/abstracting-indexing" },
  { name: "CITEDNESS IN SCOPUS", href: "/citedness-scopus" },
  { name: "PUBLICATION ETHICS", href: "/publication-ethics" },
  { name: "PEER-REVIEWERS", href: "/peer-reviewers" },
  { name: "SUBMISSION GUIDELINES", href: "/submission-guidelines" },
  { name: "AUTHOR GUIDELINES", href: "/author-guidelines" },
  { name: "PUBLICATION FEE", href: "/publication-fee" },
  { name: "ARTICLE TEMPLATE", href: "/article-template" },
  { name: "OJS GUIDELENCE", href: "/ojs-guidelines" },
  { name: "FAQ", href: "/faq" },
  { name: "CRYPTO WALLET", href: "/wallet" },
  { name: "STATISTICS", href: "/statistics" },
  { name: "RATING WEB", href: "/ratings" },
];

interface SidebarContentProps {
  onLinkClick?: () => void;
}

export function SidebarContent({ onLinkClick }: SidebarContentProps) {
  const pathname = usePathname();
  const { session, profile } = useSupabase();
  const { logout } = useLogout();

  // Form handling commented out as it's not currently used
  // const form = useForm<z.infer<typeof sidebarLoginFormSchema>>({
  //   resolver: zodResolver(sidebarLoginFormSchema),
  //   defaultValues: {
  //     username: "",
  //     password: "",
  //   },
  // });

  // function onSubmit(values: z.infer<typeof sidebarLoginFormSchema>) {
  //   toast.info("Login ditangani di halaman Login utama.");
  // }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="p-4 space-y-6">
      {session ? (
        <Card className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-sidebar-primary">
              SELAMAT DATANG
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-base">
              Halo, {profile?.first_name || "Pengguna"}!
            </p>
            <Button
              asChild
              className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            >
              <Link href="/profile" onClick={onLinkClick}>
                Edit Profil
              </Link>
            </Button>
            {profile?.role === "admin" && (
              <>
                <Button
                  asChild
                  className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                >
                  <Link href="/admin" onClick={onLinkClick}>
                    Admin Dashboard
                  </Link>
                </Button>
                <div className="border-t border-sidebar-border pt-3 mt-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    ADMIN MENU
                  </p>
                  <Button
                    asChild
                    variant="ghost"
                    className={`w-full justify-start text-left transition-colors duration-200 text-xs ${
                      // Changed text-sm to text-xs
                      pathname === "/admin/announcements"
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Link href="/admin/announcements" onClick={onLinkClick}>
                      Kelola Pengumuman
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className={`w-full justify-start text-left transition-colors duration-200 text-xs ${
                      // Changed text-sm to text-xs
                      pathname === "/admin/articles"
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Link href="/admin/articles" onClick={onLinkClick}>
                      Kelola Artikel
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className={`w-full justify-start text-left transition-colors duration-200 text-xs ${
                      // Changed text-sm to text-xs
                      pathname === "/admin/issues"
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Link href="/admin/issues" onClick={onLinkClick}>
                      Kelola Edisi
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className={`w-full justify-start text-left transition-colors duration-200 text-xs ${
                      // Changed text-sm to text-xs
                      pathname === "/admin/users"
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Link href="/admin/users" onClick={onLinkClick}>
                      Kelola Pengguna
                    </Link>
                  </Button>
                </div>
              </>
            )}
            <Button
              onClick={handleLogout}
              className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-sidebar-primary">
              USER
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              Silakan login untuk mengakses fitur lebih lanjut.
            </p>
            <Button
              asChild
              className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            >
              <Link href="/login" onClick={onLinkClick}>
                Login
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full border-sidebar-primary text-sidebar-primary hover:bg-sidebar-primary/10"
            >
              <Link href="/register" onClick={onLinkClick}>
                Daftar
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Rating Button */}
      <Card className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-sidebar-primary">
            BERI RATING
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Bagikan pendapat Anda tentang website kami!
          </p>
          <RatingDialog>
            <Button className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
              Beri Rating Website
            </Button>
          </RatingDialog>
        </CardContent>
      </Card>

      <nav className="space-y-2">
        {sidebarNavItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            className={`w-full justify-start text-left transition-colors duration-200 text-xs ${
              // Changed text-sm to text-xs
              pathname === item.href
                ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
            asChild
          >
            <Link
              href={item.href}
              className="block w-full py-2 px-4"
              onClick={onLinkClick}
            >
              {item.name}
            </Link>
          </Button>
        ))}
      </nav>

      {/* Analytics Component */}
      <AnalyticsMinimal />
    </div>
  );
}
