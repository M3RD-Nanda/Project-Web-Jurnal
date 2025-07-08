"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePathname } from "next/navigation"; // Import usePathname

export function Sidebar() {
  const pathname = usePathname(); // Get current pathname

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
    { name: "OJS GUIDELINES", href: "/ojs-guidelines" },
    { name: "STATISTICS", href: "/statistics" },
    { name: "FAQ", href: "/faq" },
  ];

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
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input type="text" id="username" placeholder="Username" className="bg-background text-foreground border-input" />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input type="password" id="password" placeholder="Password" className="bg-background text-foreground border-input" />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="remember-me" className="border-input data-[state=checked]:bg-sidebar-primary data-[state=checked]:text-sidebar-primary-foreground" />
            <Label htmlFor="remember-me" className="text-sm font-normal">Remember me</Label>
          </div>
          <Button className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">Login</Button>
        </CardContent>
      </Card>
    </aside>
  );
}