import { StaticContentPage } from "@/components/StaticContentPage";

export default function TermsOfServicePage() {
  return (
    <StaticContentPage title="SYARAT & KETENTUAN">
      <p>
        Selamat datang di Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA). Dengan mengakses atau menggunakan situs web kami, Anda setuju untuk terikat oleh Syarat & Ketentuan ini. Mohon baca dengan seksama.
      </p>
      <h3 className="text-2xl font-semibold mt-8">1. Penerimaan Syarat</h3>
      <p>
        Dengan menggunakan layanan kami, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat & Ketentuan ini, serta Kebijakan Privasi kami. Jika Anda tidak setuju dengan salah satu bagian dari syarat ini, Anda tidak boleh menggunakan layanan kami.
      </p>
      <h3 className="text-2xl font-semibold mt-8">2. Hak Kekayaan Intelektual</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>Semua konten yang diterbitkan di JIMEKA, termasuk artikel, teks, grafik, logo, dan gambar, adalah milik JIMEKA atau penulisnya dan dilindungi oleh undang-undang hak cipta.</li>
        <li>Pengguna diizinkan untuk mengunduh, mencetak, dan berbagi artikel untuk tujuan non-komersial, akademik, atau penelitian, dengan atribusi yang sesuai kepada penulis dan JIMEKA.</li>
        <li>Penggunaan komersial atau modifikasi konten tanpa izin tertulis dari JIMEKA atau pemegang hak cipta dilarang keras.</li>
      </ul>
      <h3 className="text-2xl font-semibold mt-8">3. Tanggung Jawab Pengguna</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>Anda bertanggung jawab atas semua aktivitas yang terjadi di bawah akun Anda.</li>
        <li>Anda setuju untuk tidak menggunakan situs web kami untuk tujuan ilegal atau tidak sah.</li>
        <li>Anda tidak boleh mengunggah atau menyebarkan konten yang melanggar hak kekayaan intelektual pihak ketiga, mengandung virus, atau bersifat merusak.</li>
      </ul>
      <h3 className="text-2xl font-semibold mt-8">4. Penolakan Jaminan</h3>
      <p>
        Situs web dan layanan JIMEKA disediakan "sebagaimana adanya" tanpa jaminan dalam bentuk apa pun, baik tersurat maupun tersirat. Kami tidak menjamin bahwa situs web akan bebas dari kesalahan atau gangguan.
      </p>
      <h3 className="text-2xl font-semibold mt-8">5. Perubahan Syarat</h3>
      <p>
        JIMEKA berhak untuk mengubah Syarat & Ketentuan ini kapan saja. Perubahan akan berlaku segera setelah diposting di situs web. Penggunaan Anda yang berkelanjutan atas situs web setelah perubahan tersebut merupakan penerimaan Anda terhadap syarat yang direvisi.
      </p>
    </StaticContentPage>
  );
}