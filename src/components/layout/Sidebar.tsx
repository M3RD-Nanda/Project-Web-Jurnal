"use client";

import { SidebarContent } from "./SidebarContent"; // Import the new SidebarContent

export function Sidebar() {
  return (
    <aside className="hidden md:block w-64 p-4 space-y-6 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <SidebarContent />
    </aside>
  );
}