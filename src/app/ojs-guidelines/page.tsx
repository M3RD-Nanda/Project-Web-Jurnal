import { StaticContentPage } from "@/components/StaticContentPage";

export default function OJSGuidelinesPage() {
  return (
    <StaticContentPage title="OJS GUIDELINES">
      <p>
        Jurnal Ekonomi Bisnis dan Akuntansi Mahasiswa (JEBAKA) menggunakan Open
        Journal Systems (OJS) untuk mengelola proses pengiriman, peninjauan, dan
        publikasi artikel. Panduan ini akan membantu Anda dalam menggunakan
        platform OJS kami.
      </p>
      <h3 className="text-2xl font-semibold mt-8">Untuk Penulis:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>
          <strong>Registrasi Akun:</strong> Jika Anda belum memiliki akun,
          silakan daftar sebagai penulis di portal OJS kami.
        </li>
        <li>
          <strong>Proses Pengiriman:</strong> Ikuti langkah-langkah yang diminta
          oleh sistem OJS untuk mengunggah naskah Anda, termasuk metadata
          penulis, abstrak, kata kunci, dan file naskah.
        </li>
        <li>
          <strong>Melacak Status Naskah:</strong> Anda dapat memantau status
          naskah Anda (misalnya, dalam peninjauan, revisi diminta, diterima)
          melalui akun OJS Anda.
        </li>
        <li>
          <strong>Revisi:</strong> Jika revisi diminta, unggah versi revisi
          melalui sistem OJS.
        </li>
      </ul>
      <h3 className="text-2xl font-semibold mt-8">Untuk Reviewer:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>
          <strong>Menerima Undangan:</strong> Anda akan menerima email undangan
          untuk meninjau naskah. Anda dapat menerima atau menolak undangan
          melalui OJS.
        </li>
        <li>
          <strong>Mengakses Naskah:</strong> Setelah menerima undangan, Anda
          dapat mengunduh naskah dan pedoman peninjauan melalui akun OJS Anda.
        </li>
        <li>
          <strong>Mengirimkan Ulasan:</strong> Kirimkan ulasan Anda, termasuk
          rekomendasi dan komentar, melalui sistem OJS.
        </li>
      </ul>
      <p>
        Jika Anda mengalami kesulitan teknis dengan OJS, silakan hubungi
        administrator jurnal kami.
      </p>
    </StaticContentPage>
  );
}
