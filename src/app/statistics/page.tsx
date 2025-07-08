import { StaticContentPage } from "@/components/StaticContentPage";

export default function StatisticsPage() {
  return (
    <StaticContentPage title="STATISTICS">
      <p>
        Halaman ini menyajikan statistik penting mengenai Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA). Data ini mencerminkan kinerja jurnal dan dampaknya dalam komunitas ilmiah.
      </p>
      <h3 className="text-2xl font-semibold mt-8">Statistik Publikasi:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>**Jumlah Artikel Diterbitkan (Total):** [Jumlah]</li>
        <li>**Jumlah Artikel Diterbitkan (Tahun Ini):** [Jumlah]</li>
        <li>**Tingkat Penerimaan:** [Persentase]%</li>
        <li>**Waktu Rata-rata dari Pengiriman hingga Publikasi:** [Jumlah] hari/minggu</li>
      </ul>
      <h3 className="text-2xl font-semibold mt-8">Statistik Pengunjung dan Unduhan:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>**Total Pengunjung Situs:** [Jumlah]</li>
        <li>**Total Unduhan Artikel:** [Jumlah]</li>
        <li>**Negara Pengunjung Teratas:** [Daftar Negara]</li>
      </ul>
      <h3 className="text-2xl font-semibold mt-8">Statistik Sitasi:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>**Indeks H-JIMEKA (Google Scholar):** [Angka]</li>
        <li>**Jumlah Sitasi Total (Google Scholar):** [Jumlah]</li>
        <li>**Artikel Paling Banyak Disitasi:** "[Judul Artikel]" oleh [Penulis]</li>
      </ul>
      <p>
        Data ini diperbarui secara berkala untuk memberikan gambaran yang akurat tentang pertumbuhan dan dampak JIMEKA.
      </p>
    </StaticContentPage>
  );
}