import { StaticContentPage } from "@/components/StaticContentPage";

export default function FocusScopePage() {
  return (
    <StaticContentPage title="FOCUS AND SCOPE">
      <p>
        Jurnal Ekonomi Bisnis dan Akuntansi Mahasiswa (JEBAKA) berfokus pada
        publikasi penelitian orisinal di berbagai aspek Ekonomi dan Akuntansi.
        Kami menyambut kontribusi dari mahasiswa, akademisi, dan praktisi.
      </p>
      <h3 className="text-2xl font-semibold mt-8">Fokus Jurnal:</h3>
      <p>
        JEBAKA berfokus pada penyebaran hasil penelitian yang inovatif dan
        relevan yang berkontribusi pada pengembangan teori dan praktik di bidang
        Ekonomi dan Akuntansi.
      </p>
      <h3 className="text-2xl font-semibold mt-8">Ruang Lingkup:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>Ekonomi Mikro dan Makro</li>
        <li>Ekonomi Pembangunan</li>
        <li>Ekonomi Syariah</li>
        <li>Akuntansi Keuangan</li>
        <li>Akuntansi Manajemen</li>
        <li>Akuntansi Sektor Publik</li>
        <li>Perpajakan</li>
        <li>Audit</li>
        <li>Sistem Informasi Akuntansi</li>
        <li>Pasar Modal dan Investasi</li>
        <li>Manajemen Keuangan</li>
        <li>Perilaku Organisasi dalam Konteks Ekonomi dan Akuntansi</li>
        <li>Dan topik terkait lainnya.</li>
      </ul>
      <p>
        Kami mendorong pengiriman artikel yang menggunakan metodologi penelitian
        yang kuat dan memberikan implikasi praktis atau kebijakan yang jelas.
      </p>
    </StaticContentPage>
  );
}
