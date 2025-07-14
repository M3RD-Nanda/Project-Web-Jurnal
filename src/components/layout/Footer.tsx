"use client";

import Link from "next/link";
import { useState } from "react";

export function Footer() {
  // Initialize currentYear directly with the current year to prevent hydration mismatch
  const [currentYear] = useState(new Date().getFullYear());

  // The useEffect is no longer needed for setting the year, but can be kept if there's
  // any other client-side logic that needs to run after mount.
  // For this specific case, it can be removed.
  // useEffect(() => {
  //   setCurrentYear(new Date().getFullYear());
  // }, []);

  const footerNavItems = [
    { name: "Kebijakan Privasi", href: "/privacy-policy" },
    { name: "Syarat & Ketentuan", href: "/terms-of-service" },
    { name: "Kontak Kami", href: "/contact" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground p-4 shadow-inner mt-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex flex-col">
          <p className="text-sm">
            &copy; {currentYear} Jurnal Ekonomi Bisnis dan Akuntansi Mahasiswa
            (JEBAKA).
          </p>
          <p className="text-xs opacity-80">
            Diterbitkan oleh Universitas Percobaan Nanda.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center md:justify-end gap-2 md:gap-4 mt-4 md:mt-0">
          {footerNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-xs md:text-sm hover:underline opacity-90"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
