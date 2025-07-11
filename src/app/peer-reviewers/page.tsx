import { StaticContentPage } from "@/components/StaticContentPage";

export default function PeerReviewersPage() {
  return (
    <StaticContentPage title="PEER-REVIEWERS">
      <p>
        Jurnal Ekonomi Bisnis dan Akuntansi Mahasiswa (JEBAKA) sangat bergantung
        pada kontribusi berharga dari para peer-reviewer kami. Mereka adalah
        para ahli di bidangnya yang secara sukarela mendedikasikan waktu dan
        keahlian mereka untuk mengevaluasi kualitas, orisinalitas, dan relevansi
        ilmiah dari naskah yang dikirimkan.
      </p>
      <h3 className="text-2xl font-semibold mt-8">Peran Peer-Reviewer:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>Memberikan ulasan yang konstruktif dan objektif.</li>
        <li>Membantu editor dalam membuat keputusan editorial.</li>
        <li>Memastikan kualitas ilmiah dan integritas artikel.</li>
        <li>Mengidentifikasi potensi plagiarisme atau malpraktik.</li>
      </ul>
      <h3 className="text-2xl font-semibold mt-8">Daftar Peer-Reviewer:</h3>
      <p>
        JEBAKA memiliki daftar reviewer yang luas dari berbagai institusi dan
        negara. Kami sangat menghargai kontribusi mereka dalam menjaga standar
        kualitas jurnal. Daftar lengkap reviewer akan diperbarui secara berkala.
      </p>
      <p>
        Jika Anda tertarik untuk menjadi peer-reviewer untuk JEBAKA, silakan
        hubungi kami dengan menyertakan CV dan bidang keahlian Anda.
      </p>
    </StaticContentPage>
  );
}
