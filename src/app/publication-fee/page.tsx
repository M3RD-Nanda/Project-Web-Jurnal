import { StaticContentPage } from "@/components/StaticContentPage";

export default function PublicationFeePage() {
  return (
    <StaticContentPage title="PUBLICATION FEE">
      <p>
        Jurnal Ekonomi Bisnis dan Akuntansi Mahasiswa (JEBAKA) adalah jurnal
        open-access, yang berarti semua artikel yang diterbitkan tersedia secara
        gratis untuk dibaca dan diunduh oleh siapa saja. Untuk mendukung model
        open-access ini dan menutupi biaya operasional (termasuk proses
        peer-review, editing, tata letak, dan hosting), JEBAKA menerapkan Biaya
        Pemrosesan Artikel (Article Processing Charge/APC).
      </p>
      <h3 className="text-2xl font-semibold mt-8">Rincian Biaya:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>
          <strong>Untuk Penulis dari Universitas Percobaan Nanda:</strong> Rp.
          100.000
        </li>
        <li>
          <strong>Untuk Penulis dari Luar Universitas Percobaan Nanda:</strong>{" "}
          Rp. 200.000
        </li>
        <li>
          <strong>Untuk Penulis Internasional:</strong> 25 US dollars
        </li>
      </ul>
      <p>
        Biaya ini akan dikenakan setelah artikel diterima untuk publikasi. Tidak
        ada biaya pengiriman awal.
      </p>
      <h3 className="text-2xl font-semibold mt-8">
        Kebijakan Pengabaian (Waiver Policy):
      </h3>
      <p>
        JEBAKA memiliki kebijakan pengabaian biaya untuk penulis dari negara
        berpenghasilan rendah atau dalam kasus-kasus tertentu yang memerlukan
        dukungan finansial. Permohonan pengabaian harus diajukan bersamaan
        dengan pengiriman naskah.
      </p>
      <p>
        Untuk informasi lebih lanjut mengenai pembayaran atau permohonan
        pengabaian, silakan hubungi tim editorial kami.
      </p>
    </StaticContentPage>
  );
}
