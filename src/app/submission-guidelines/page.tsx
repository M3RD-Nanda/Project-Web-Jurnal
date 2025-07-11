import { StaticContentPage } from "@/components/StaticContentPage";

export default function SubmissionGuidelinesPage() {
  return (
    <StaticContentPage title="SUBMISSION GUIDELINES">
      <p>
        Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA) mengundang para penulis untuk mengirimkan naskah orisinal mereka. Untuk memastikan kelancaran proses pengiriman dan peninjauan, mohon ikuti pedoman pengiriman berikut:
      </p>
      <h3 className="text-2xl font-semibold mt-8">Persyaratan Umum:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>Naskah harus orisinal dan belum pernah diterbitkan sebelumnya di jurnal lain.</li>
        <li>Naskah harus sesuai dengan fokus dan ruang lingkup JIMEKA.</li>
        <li>Penulis harus mematuhi etika publikasi yang ditetapkan oleh JIMEKA.</li>
      </ul>
      <h3 className="text-2xl font-semibold mt-8">Format Naskah:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>Gunakan template artikel resmi JIMEKA (tersedia di halaman "Article Template").</li>
        <li>Panjang naskah antara 5.000 - 8.000 kata (termasuk abstrak, referensi, tabel, dan gambar).</li>
        <li>Abstrak tidak lebih dari 250 kata, diikuti oleh 3-5 kata kunci.</li>
        <li>Gunakan gaya sitasi APA (American Psychological Association) edisi terbaru.</li>
      </ul>
      <h3 className="text-2xl font-semibold mt-8">Proses Pengiriman:</h3>
      <p>
        Naskah harus dikirimkan melalui sistem Open Journal Systems (OJS) kami. Pastikan semua informasi penulis lengkap dan akurat.
      </p>
      <p>
        Untuk panduan lebih rinci tentang penggunaan OJS, silakan kunjungi halaman "OJS Guidelines".
      </p>
    </StaticContentPage>
  );
}