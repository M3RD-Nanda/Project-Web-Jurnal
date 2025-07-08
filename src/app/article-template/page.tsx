import { StaticContentPage } from "@/components/StaticContentPage";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ArticleTemplatePage() {
  return (
    <StaticContentPage title="ARTICLE TEMPLATE">
      <p>
        Untuk memastikan konsistensi dan kualitas presentasi artikel, Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA) mewajibkan semua penulis untuk menggunakan template artikel resmi kami. Menggunakan template ini akan membantu Anda dalam memformat naskah sesuai dengan pedoman jurnal.
      </p>
      <h3 className="text-2xl font-semibold mt-8">Unduh Template:</h3>
      <p>
        Anda dapat mengunduh template artikel dalam format Microsoft Word (.docx) di bawah ini:
      </p>
      <div className="mt-4">
        <Button asChild>
          <Link href="/templates/jimeka-article-template.docx" download>
            Unduh Template Artikel JIMEKA (.docx)
          </Link>
        </Button>
      </div>
      <h3 className="text-2xl font-semibold mt-8">Petunjuk Penggunaan Template:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>Gunakan gaya yang sudah ditentukan dalam template untuk judul, sub-judul, teks, kutipan, daftar, dll.</li>
        <li>Jangan mengubah pengaturan margin, ukuran kertas, atau font dasar.</li>
        <li>Pastikan semua gambar dan tabel disisipkan dengan benar dan diberi label sesuai petunjuk.</li>
        <li>Periksa kembali sitasi dan daftar pustaka Anda agar sesuai dengan APA Style edisi terbaru.</li>
      </ul>
      <p>
        Mengikuti template ini dengan cermat akan mempercepat proses editorial dan memastikan artikel Anda siap untuk publikasi.
      </p>
    </StaticContentPage>
  );
}