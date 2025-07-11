import { StaticContentPage } from "@/components/StaticContentPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { ContactForm } from "@/components/ContactForm"; // Import the new ContactForm

export default function ContactPage() {
  return (
    <StaticContentPage title="KONTAK KAMI">
      <p>
        Jika Anda memiliki pertanyaan, masukan, atau membutuhkan bantuan, jangan
        ragu untuk menghubungi tim Jurnal Ekonomi Bisnis dan Akuntansi Mahasiswa
        (JEBAKA). Kami siap membantu Anda.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <Card className="text-center">
          <CardHeader>
            <Mail className="h-10 w-10 text-primary mx-auto mb-2" />
            <CardTitle className="text-xl">Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">m.3rd.nanda@gmail.com</p>
            <p className="text-sm text-muted-foreground">
              Untuk pertanyaan umum, pengiriman artikel, atau dukungan teknis.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Phone className="h-10 w-10 text-primary mx-auto mb-2" />
            <CardTitle className="text-xl">Telepon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">+62 000-0000-0000</p>
            <p className="text-sm text-muted-foreground">
              Jam Kerja: Senin - Jumat, 09:00 - 16:00 WIB
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <MapPin className="h-10 w-10 text-primary mx-auto mb-2" />
            <CardTitle className="text-xl">Alamat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              Fakultas Ekonomi dan Bisnis
              <br />
              Universitas Percobaan Nanda
              <br />
              Kota Medan
              <br />
              Indonesia
            </p>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-2xl font-semibold mt-8">Kirim Pesan kepada Kami</h3>
      <p>
        Gunakan formulir di bawah ini untuk mengirimkan pertanyaan atau masukan
        Anda secara langsung.
      </p>
      <ContactForm />
    </StaticContentPage>
  );
}
