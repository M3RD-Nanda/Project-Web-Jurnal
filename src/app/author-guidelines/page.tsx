import { StaticContentPage } from "@/components/StaticContentPage";

export default function AuthorGuidelinesPage() {
  return (
    <StaticContentPage title="AUTHOR GUIDELINES">
      <p>
        Panduan Penulis ini dirancang untuk membantu Anda dalam mempersiapkan naskah Anda untuk Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA). Mematuhi panduan ini akan mempercepat proses peninjauan dan publikasi.
      </p>
      <h3 className="text-2xl font-semibold mt-8">Struktur Artikel:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>**Judul:** Jelas, ringkas, dan mencerminkan isi artikel.</li>
        <li>**Abstrak:** Ringkasan singkat penelitian (maks. 250 kata) dan 3-5 kata kunci.</li>
        <li>**Pendahuluan:** Latar belakang, rumusan masalah, tujuan, dan kontribusi penelitian.</li>
        <li>**Tinjauan Pustaka:** Landasan teori dan penelitian sebelumnya.</li>
        <li>**Metodologi Penelitian:** Desain penelitian, populasi, sampel, metode pengumpulan data, dan analisis data.</li>
        <li>**Hasil dan Pembahasan:** Presentasi temuan dan interpretasinya.</li>
        <li>**Kesimpulan dan Saran:** Ringkasan temuan utama, implikasi, keterbatasan, dan saran untuk penelitian selanjutnya.</li>
        <li>**Daftar Pustaka:** Semua sumber yang dikutip dalam teks.</li>
      </ul>
      <h3 className="text-2xl font-semibold mt-8">Gaya Penulisan:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>Gunakan bahasa Indonesia yang baku dan jelas.</li>
        <li>Gunakan format APA Style edisi terbaru untuk sitasi dan daftar pustaka.</li>
        <li>Tabel dan gambar harus diberi nomor dan judul yang jelas.</li>
      </ul>
      <p>
        Untuk detail lebih lanjut dan template, silakan kunjungi halaman "Article Template".
      </p>
    </StaticContentPage>
  );
}