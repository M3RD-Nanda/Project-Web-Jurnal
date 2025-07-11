import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CallForPapersSection() {
  return (
    <section className="bg-accent text-accent-foreground p-8 rounded-lg shadow-md text-center animate-in fade-in duration-1000">
      <h2 className="text-3xl font-bold mb-4">Panggilan untuk Artikel</h2>
      <p className="text-lg mb-6">
        Kami mengundang para akademisi, peneliti, dan praktisi untuk
        mengirimkan naskah asli mereka. Jadilah bagian dari kontribusi ilmiah
        di bidang Ekonomi dan Akuntansi.
      </p>
      <Button
        asChild
        className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300"
      >
        <Link href="/submission-guidelines">Informasi Pengiriman</Link>
      </Button>
    </section>
  );
}
