"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const sidebarLoginFormSchema = z.object({
  username: z.string().min(1, { message: "Nama pengguna tidak boleh kosong." }),
  password: z.string().min(6, { message: "Kata sandi harus minimal 6 karakter." }),
});

export function Sidebar() {
  const pathname = usePathname();

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
    { name: "STATISTICS", href: "/statistics" },
    { name: "FAQ", href: "/faq" },
  ];

  const form = useForm<z.infer<typeof sidebarLoginFormSchema>>({
    resolver: zodResolver(sidebarLoginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof sidebarLoginFormSchema>) {
    console.log(values);
    toast.success("Login sidebar berhasil! (Simulasi)");
    // Di sini Anda akan mengintegrasikan logika login sebenarnya untuk sidebar.
  }

  return (
    <aside className="w-full md:w-64 p-4 space-y-6 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <nav className="space-y-2">
        {sidebarNavItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            className={`w-full justify-start text-left transition-colors duration-200 ${
              pathname === item.href
                ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Link href={item.href} className="block w-full py-2 px-4">
              {item.name}
            </Link>
          </Button>
        ))}
      </nav>

      <Card className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-sidebar-primary">VISITORS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Image
              src="/stat-counter.png" // Placeholder for stat counter image
              alt="Stat Counter"
              width={100}
              height={50}
              className="object-contain"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-sidebar-primary">USER</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" className="bg-background text-foreground border-input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Password" className="bg-background text-foreground border-input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" className="border-input data-[state=checked]:bg-sidebar-primary data-[state=checked]:text-sidebar-primary-foreground" />
                <Label htmlFor="remember-me" className="text-sm font-normal">Remember me</Label>
              </div>
              <Button type="submit" className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">Login</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </aside>
  );
}