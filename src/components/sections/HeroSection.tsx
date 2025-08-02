import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        {/* Optimize LCP by using semantic HTML and critical CSS */}
        <h1 className="hero-title">
          Jurnal Ekonomi Bisnis dan Akuntansi Mahasiswa
        </h1>
        <p className="text-lg md:text-xl mb-6 opacity-90">
          Platform terkemuka untuk publikasi penelitian inovatif di bidang
          Ekonomi dan Akuntansi dari Universitas Percobaan Nanda.
        </p>

        {/* Professional experimental project warning */}
        <div
          role="status"
          aria-live="polite"
          className="mb-6 rounded-md border border-amber-300/60 bg-amber-50/80 text-amber-900 dark:border-amber-400/30 dark:bg-amber-950/40 dark:text-amber-200 px-4 py-3 shadow-sm"
        >
          <div className="flex items-start gap-3 md:gap-4">
            {/* Left warning icon */}
            <AlertTriangle
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 md:h-6 md:w-6 text-amber-500 dark:text-amber-300 flex-shrink-0"
            />
            {/* Text content */}
            <p className="flex-1 text-sm md:text-base leading-relaxed text-balance">
              <span className="font-semibold">Peringatan:</span> Proyek web
              jurnal ini bukan versi resmi, melainkan sebuah eksperimen yang
              dibuat oleh
              <span className="font-semibold"> Muhammad Trinanda</span>{" "}
              menggunakan <span className="font-semibold">Next.js</span>.
            </p>
            {/* Right warning icon */}
            <AlertTriangle
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 md:h-6 md:w-6 text-amber-500 dark:text-amber-300 flex-shrink-0"
            />
          </div>
        </div>

        <Button
          asChild
          className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors duration-300"
        >
          <Link href="/submission-guidelines" prefetch={true}>
            Kirim Artikel Anda Sekarang
          </Link>
        </Button>
      </div>
    </section>
  );
}
