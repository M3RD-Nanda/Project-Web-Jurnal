"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Footer() {
  const [currentYear, setCurrentYear] = useState(2025);

  useEffect(() => {
    // Set the actual current year only on the client side
    setCurrentYear(new Date().getFullYear());
  }, []);
  const footerNavItems = [
    { name: "Kebijakan Privasi", href: "/privacy-policy" },
    { name: "Syarat & Ketentuan", href: "/terms-of-service" },
    { name: "Kontak Kami", href: "/contact" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground p-6 shadow-inner mt-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex flex-col">
          <p className="text-sm">
            &copy; {currentYear} Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi
            (JIMEKA).
          </p>
          <p className="text-xs opacity-80">
            Diterbitkan oleh Universitas Percobaan Nanda.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center md:justify-end gap-4 mt-4 md:mt-0">
          {footerNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm hover:underline opacity-90"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
