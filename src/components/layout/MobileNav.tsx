"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"; // Import SheetTitle
import { Menu } from "lucide-react";
import { SidebarContent } from "./SidebarContent";
import { ModeToggle } from "@/components/ui/mode-toggle";

export function MobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" /> {/* Removed text-primary-foreground here */}
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
        <div className="flex items-center gap-x-2 p-4 border-b border-sidebar-border"> {/* Adjusted: removed justify-between, added gap-x-2 */}
          <SheetTitle className="text-lg font-semibold text-sidebar-primary">Menu JIMEKA</SheetTitle> {/* Wrap h2 with SheetTitle */}
          <ModeToggle />
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent onLinkClick={() => setIsOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}