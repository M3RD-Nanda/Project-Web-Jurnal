import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

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
