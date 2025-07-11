import { StaticContentPage } from "@/components/StaticContentPage";

export default function PublicationEthicsPage() {
  return (
    <StaticContentPage title="PUBLICATION ETHICS">
      <p>
        Jurnal Ekonomi Bisnis dan Akuntansi Mahasiswa (JEBAKA) berkomitmen untuk
        menjunjung tinggi standar etika publikasi tertinggi. Kami mengikuti
        pedoman dari Committee on Publication Ethics (COPE) dan memastikan
        integritas dalam setiap tahap proses publikasi.
      </p>
      <h3 className="text-2xl font-semibold mt-8">
        Prinsip-prinsip Etika Publikasi Kami:
      </h3>
      <ul className="list-disc list-inside space-y-2">
        <li>
          <strong>Kewajiban Penulis:</strong> Orisinalitas, menghindari
          plagiarisme, pengakuan sumber, pengungkapan konflik kepentingan, dan
          akurasi data.
        </li>
        <li>
          <strong>Kewajiban Editor:</strong> Keputusan yang adil dan objektif,
          menjaga kerahasiaan, menghindari konflik kepentingan, dan memastikan
          proses peer-review yang adil.
        </li>
        <li>
          <strong>Kewajiban Reviewer:</strong> Objektivitas, menjaga
          kerahasiaan, pengungkapan konflik kepentingan, dan memberikan ulasan
          yang konstruktif.
        </li>
        <li>
          <strong>Penanganan Malpraktik:</strong> JEBAKA akan mengambil tindakan
          yang tepat jika ada dugaan malpraktik publikasi, termasuk penarikan
          artikel jika terbukti ada pelanggaran etika serius.
        </li>
      </ul>
      <p>
        Semua pihak yang terlibat dalam proses publikasi (penulis, editor, dan
        reviewer) diharapkan untuk mematuhi pedoman etika ini.
      </p>
    </StaticContentPage>
  );
}
