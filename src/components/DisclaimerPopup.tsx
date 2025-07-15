"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Code,
  Database,
  Wallet,
  Users,
  BarChart3,
  Star,
  Settings,
  Smartphone,
  Moon,
  CheckCircle,
} from "lucide-react";

export function DisclaimerPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if disclaimer has been shown before
    const disclaimerShown = localStorage.getItem("disclaimer-shown");

    if (!disclaimerShown) {
      // Show disclaimer after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Mark disclaimer as shown
    localStorage.setItem("disclaimer-shown", "true");
  };

  const features = [
    {
      icon: <Code className="h-4 w-4" />,
      title: "Academic Journal Platform",
      description: "Article management & submission system",
    },
    {
      icon: <Users className="h-4 w-4" />,
      title: "User Authentication",
      description: "Secure login & registration with Supabase",
    },
    {
      icon: <Wallet className="h-4 w-4" />,
      title: "Web3 Crypto Wallet",
      description: "MetaMask, WalletConnect, Solana integration",
    },
    {
      icon: <Database className="h-4 w-4" />,
      title: "Multi-chain Support",
      description: "Ethereum, Polygon, Optimism, Arbitrum, Base",
    },
    {
      icon: <BarChart3 className="h-4 w-4" />,
      title: "Analytics & Statistics",
      description: "Comprehensive data visualization",
    },
    {
      icon: <Star className="h-4 w-4" />,
      title: "Rating System",
      description: "User feedback and rating functionality",
    },
    {
      icon: <Settings className="h-4 w-4" />,
      title: "Admin Panel",
      description: "Content management system",
    },
    {
      icon: <Smartphone className="h-4 w-4" />,
      title: "Responsive Design",
      description: "Mobile & desktop optimized",
    },
    {
      icon: <Moon className="h-4 w-4" />,
      title: "Theme Support",
      description: "Dark & light mode switching",
    },
  ];

  const techStack = [
    { name: "Next.js 15.3.4", category: "Framework" },
    { name: "TypeScript", category: "Language" },
    { name: "Supabase", category: "Database & Auth" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "Shadcn/UI", category: "UI Components" },
    { name: "Radix UI", category: "Primitives" },
    { name: "WalletConnect", category: "Web3" },
    { name: "Solana", category: "Blockchain" },
    { name: "React Hook Form", category: "Forms" },
    { name: "Zod", category: "Validation" },
    { name: "Sonner", category: "Notifications" },
    { name: "Recharts", category: "Charts" },
    { name: "Lucide React", category: "Icons" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <DialogTitle className="text-xl font-bold">
              Disclaimer & Website Information
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Website portofolio yang menampilkan kemampuan fullstack development
          </DialogDescription>
        </DialogHeader>

        {/* Disclaimer Section - Outside DialogDescription to avoid nesting */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 -mt-2">
          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
            <strong>Disclaimer:</strong> Jurnal ilmiah ini bukan asli tetapi
            hanya sebuah website portofolio yang dibuat oleh{" "}
            <strong>Muhammad Trinanda</strong> sebagai sebuah kredibilitas pada
            bidang pembuatan website{" "}
            <em className="font-semibold">"Fullstack Developer"</em>.
          </p>
        </div>

        <div className="space-y-6">
          {/* Features Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Fitur Website
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="text-primary mt-0.5">{feature.icon}</div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tech Stack Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Code className="h-5 w-5 text-blue-500" />
              Teknologi yang Digunakan
            </h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-1 hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                >
                  <span className="font-medium">{tech.name}</span>
                  <span className="text-muted-foreground ml-1">
                    ({tech.category})
                  </span>
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Footer */}
          <div className="flex justify-center pt-2">
            <Button onClick={handleClose} className="px-8">
              Mengerti, Lanjutkan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
