import { StaticContentPage } from "@/components/StaticContentPage";

export default function OJSGuidelinesPage() {
  return (
    <StaticContentPage title="OJS GUIDELINES">
      <p>
        Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA) menggunakan Open Journal Systems (OJS) untuk mengelola proses pengiriman, peninjauan, dan publikasi artikel. Panduan ini akan membantu Anda dalam menggunakan platform OJS kami.
      </p>
      <h3 className="text-2xl font-semibold mt-8">Untuk Penulis:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>**Registrasi Akun:** Jika Anda belum memiliki akun, silakan daftar sebagai penulis di portal OJS kami.</li>
        <li>**Proses Pengiriman:** Ikuti langkah-langkah yang diminta oleh sistem OJS untuk mengunggah naskah Anda, termasuk metadata penulis, abstrak, kata kunci, dan file naskah.</li>
        <li>**Melacak Status Naskah:** Anda dapat memantau status naskah Anda (misalnya, dalam peninjauan, revisi diminta, diterima) melalui akun OJS Anda.</li>
        <li>**Revisi:** Jika revisi diminta, unggah versi revisi melalui sistem OJS.</li>
      </ul>
      <h3 className="text-2xl font-semibold mt-8">Untuk Reviewer:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>**Menerima Undangan:** Anda akan menerima email undangan untuk meninjau naskah. Anda dapat menerima atau menolak undangan melalui OJS.</li>
        <li>**Mengakses Naskah:** Setelah menerima undangan, Anda dapat mengunduh naskah dan pedoman peninjauan melalui akun OJS Anda.</li>
        <li>**Mengirimkan Ulasan:** Kirimkan ulasan Anda, termasuk rekomendasi dan komentar, melalui sistem OJS.</li>
      </ul>
      <p>
        Jika Anda mengalami kesulitan teknis dengan OJS, silakan hubungi administrator jurnal kami.
      </p>
    </StaticContentPage>
  );
}