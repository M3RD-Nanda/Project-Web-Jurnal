import { StaticContentPage } from "@/components/StaticContentPage";

export default function AbstractingIndexingPage() {
  return (
    <StaticContentPage title="ABSTRACTING AND INDEXING">
      <p>
        Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA) berkomitmen untuk meningkatkan visibilitas dan aksesibilitas artikel yang diterbitkan. Oleh karena itu, jurnal kami diindeks dan diabstraksi di berbagai basis data ilmiah terkemuka.
      </p>
      <h3 className="text-2xl font-semibold mt-8">JIMEKA saat ini diindeks oleh:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>Google Scholar</li>
        <li>Garuda (Garba Rujukan Digital)</li>
        <li>SINTA (Science and Technology Index) - Kementerian Riset dan Teknologi/Badan Riset dan Inovasi Nasional</li>
        <li>DOAJ (Directory of Open Access Journals) - *Target untuk masa depan*</li>
        <li>Crossref</li>
        <li>Dan lainnya.</li>
      </ul>
      <p>
        Kami terus berupaya untuk memperluas cakupan pengindeksan kami agar penelitian yang diterbitkan di JIMEKA dapat diakses oleh audiens global yang lebih luas.
      </p>
    </StaticContentPage>
  );
}