import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-primary to-jimeka-blue text-primary-foreground p-8 rounded-lg shadow-lg animate-in fade-in zoom-in duration-500">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
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
          <Link href="/submission-guidelines">
            Kirim Artikel Anda Sekarang
          </Link>
        </Button>
      </div>
    </section>
  );
}
