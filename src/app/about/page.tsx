import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8 container mx-auto">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Tentang Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-lg">
            <p>
              Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA) adalah jurnal peer-review dan open-access yang diterbitkan oleh Fakultas Ekonomi dan Bisnis, Universitas Percobaan Nanda. JIMEKA didedikasikan untuk mempublikasikan hasil penelitian orisinal dan berkualitas tinggi dari mahasiswa, akademisi, dan peneliti di bidang Ekonomi dan Akuntansi.
            </p>
            <p>
              Kami berkomitmen untuk menjadi platform terkemuka dalam penyebaran pengetahuan ilmiah, memfasilitasi diskusi, dan mendorong inovasi dalam disiplin ilmu Ekonomi dan Akuntansi. JIMEKA menerima berbagai jenis artikel, termasuk penelitian empiris, studi kasus, tinjauan literatur, dan artikel konseptual yang relevan dengan fokus dan ruang lingkup jurnal.
            </p>
            <p>
              Setiap artikel yang dikirimkan akan melalui proses peninjauan sejawat (peer-review) yang ketat untuk memastikan kualitas, orisinalitas, dan relevansi ilmiah. Kami mengundang para peneliti untuk berkontribusi pada jurnal kami dan menjadi bagian dari komunitas ilmiah yang dinamis.
            </p>
            <h3 className="text-2xl font-semibold mt-8">Visi Kami</h3>
            <p>
              Menjadi jurnal ilmiah terkemuka di tingkat nasional dan internasional dalam bidang Ekonomi dan Akuntansi, yang berkontribusi pada pengembangan ilmu pengetahuan dan praktik profesional.
            </p>
            <h3 className="text-2xl font-semibold mt-8">Misi Kami</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Mempublikasikan hasil penelitian orisinal dan inovatif.</li>
              <li>Mendorong pertukaran ide dan kolaborasi antar peneliti.</li>
              <li>Menyediakan akses terbuka terhadap informasi ilmiah berkualitas.</li>
              <li>Meningkatkan kualitas dan relevansi penelitian di bidang Ekonomi dan Akuntansi.</li>
            </ul>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}