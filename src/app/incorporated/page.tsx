import { StaticContentPage } from "@/components/StaticContentPage";

export default function IncorporatedPage() {
  return (
    <StaticContentPage title="INCORPORATED WITH">
      <p>
        Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA) bangga berkolaborasi dengan berbagai institusi dan organisasi terkemuka untuk memajukan penelitian di bidang Ekonomi dan Akuntansi.
      </p>
      <p>
        Kami percaya bahwa kemitraan strategis adalah kunci untuk mencapai keunggulan akademik dan menyebarkan pengetahuan yang berdampak luas.
      </p>
      <h3 className="text-2xl font-semibold mt-8">Mitra Kami:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>Asosiasi Dosen Ekonomi Indonesia (ADEI)</li>
        <li>Ikatan Akuntan Indonesia (IAI)</li>
        <li>Pusat Studi Ekonomi dan Bisnis Universitas Syiah Kuala</li>
        <li>Dan berbagai universitas serta lembaga penelitian lainnya.</li>
      </ul>
      <p>
        Kolaborasi ini memungkinkan kami untuk memperluas jangkauan, meningkatkan kualitas publikasi, dan memfasilitasi pertukaran ide di antara para peneliti.
      </p>
    </StaticContentPage>
  );
}