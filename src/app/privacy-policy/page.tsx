import { StaticContentPage } from "@/components/StaticContentPage";

export default function PrivacyPolicyPage() {
  return (
    <StaticContentPage title="KEBIJAKAN PRIVASI">
      <p>
        Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA) berkomitmen untuk melindungi privasi pengguna dan penulis kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.
      </p>
      <h3 className="text-2xl font-semibold mt-8">Informasi yang Kami Kumpulkan:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li><strong>Informasi Pendaftaran:</strong> Saat Anda mendaftar akun, kami mengumpulkan nama, alamat email, afiliasi institusi, dan informasi kontak lainnya.</li>
        <li><strong>Informasi Pengiriman Artikel:</strong> Saat Anda mengirimkan artikel, kami mengumpulkan data terkait naskah, nama penulis, dan metadata lainnya.</li>
        <li><strong>Data Penggunaan:</strong> Kami mengumpulkan data anonim tentang bagaimana Anda berinteraksi dengan situs web kami, seperti halaman yang dikunjungi, waktu yang dihabiskan, dan unduhan artikel, untuk tujuan analisis dan peningkatan layanan.</li>
      </ul>
      <h3 className="text-2xl font-semibold mt-8">Bagaimana Kami Menggunakan Informasi Anda:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>Untuk mengelola akun Anda dan memproses pengiriman artikel.</li>
        <li>Untuk berkomunikasi dengan Anda mengenai status artikel, pengumuman jurnal, atau informasi penting lainnya.</li>
        <li>Untuk meningkatkan pengalaman pengguna dan fungsionalitas situs web kami.</li>
        <li>Untuk tujuan statistik dan pelaporan internal.</li>
      </ul>
      <h3 className="text-2xl font-semibold mt-8">Perlindungan Data:</h3>
      <p>
        Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai untuk melindungi informasi pribadi Anda dari akses tidak sah, pengungkapan, perubahan, atau penghancuran.
      </p>
      <p>
        Kami tidak akan menjual, menyewakan, atau mendistribusikan informasi pribadi Anda kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum.
      </p>
      <p>
        Dengan menggunakan situs web JIMEKA, Anda menyetujui pengumpulan dan penggunaan informasi Anda sesuai dengan Kebijakan Privasi ini.
      </p>
    </StaticContentPage>
  );
}