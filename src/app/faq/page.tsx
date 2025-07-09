import { StaticContentPage } from "@/components/StaticContentPage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FAQPage() {
  const faqs = [
    {
      question: "Bagaimana cara mengirimkan artikel ke JIMEKA?",
      answer: "Anda dapat mengirimkan artikel Anda melalui sistem Open Journal Systems (OJS) kami. Silakan kunjungi halaman 'Submission Guidelines' untuk detail lebih lanjut.",
    },
    {
      question: "Apakah JIMEKA mengenakan biaya publikasi?",
      answer: "Ya, JIMEKA menerapkan Biaya Pemrosesan Artikel (APC) untuk mendukung model open-access. Rincian biaya dan kebijakan pengabaian dapat ditemukan di halaman 'Publication Fee'.",
    },
    {
      question: "Berapa lama proses peninjauan artikel?",
      answer: "Waktu rata-rata proses peninjauan bervariasi, tetapi kami berusaha untuk menyelesaikan proses peninjauan dalam waktu 4-8 minggu. Anda dapat melacak status naskah Anda melalui akun OJS Anda.",
    },
    {
      question: "Apakah JIMEKA diindeks di Scopus?",
      answer: "JIMEKA sedang dalam proses pengajuan untuk diindeks di Scopus. Kami terus berupaya untuk memenuhi standar kualitas yang diperlukan. Informasi lebih lanjut tersedia di halaman 'Citedness in Scopus'.",
    },
    {
      question: "Bagaimana cara menjadi reviewer untuk JIMEKA?",
      answer: "Jika Anda tertarik untuk menjadi reviewer, silakan hubungi tim editorial kami dengan menyertakan CV dan bidang keahlian Anda. Kami selalu mencari reviewer yang berkualitas.",
    },
    {
      question: "Siapa pembuat website jurnal ilmiah ini?",
      answer: `Pembuat website ini adalah seorang pria bernama Muhammad Trinanda. Ia memiliki pengetahuan luas dan keterampilan di segala bidang, antara lain:

Teknologi dan Komputer – kecerdasan buatan (AI), teknik perangkat lunak & perangkat keras, bahasa pemrograman, hacking & cracking, teknologi Web 3.0 (cryptocurrency), pembuatan aplikasi Android (Flutter, Android Studio), pembuatan website (Next.js, React.js, full-stack development – frontend & backend), serta pembuatan database (SQL: PostgreSQL, MySQL; Tableau, Looker Studio).

Multimedia dan Desain – Adobe Photoshop, Premiere Pro, After Effects, pemodelan 3D (Blender), arsitektur (AutoCAD, SketchUp).

Pengembangan Game – Unity, Godot, Unreal Engine 4.

Akuntansi dan Perkantoran – aplikasi Accurate (jurnal akuntansi), Microsoft Office.

Seni dan Kreativitas – seni, musik (Piano, Seruling, Harmonika, Violin), musik digital (FL Studio).

Ilmu Terapan dan Hobi – robotika, olahraga.

Dan lain-lain – sebagai wujud eksplorasi keilmuan yang terus berkembang.`,
    },
  ];

  return (
    <StaticContentPage title="FREQUENTLY ASKED QUESTIONS (FAQ)">
      <p>
        Berikut adalah beberapa pertanyaan yang sering diajukan mengenai Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA). Jika Anda tidak menemukan jawaban atas pertanyaan Anda di sini, jangan ragu untuk menghubungi kami.
      </p>
      <Accordion type="single" collapsible className="w-full mt-6">
        {faqs.map((faq, index) => (
          <AccordionItem value={`item-${index + 1}`} key={index}>
            <AccordionTrigger className="text-left text-lg font-medium hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground whitespace-pre-line">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* New section for creator */}
      <div className="mt-8">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Tentang Pencipta Website</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4">
            <Image
              src="/images/muhammad-trinanda.jpg"
              alt="Foto Muhammad Trinanda"
              width={150}
              height={150}
              className="rounded-full object-cover border-4 border-primary shadow-md"
            />
            <h3 className="text-xl font-semibold">Muhammad Trinanda</h3>
            <p className="text-muted-foreground">
              Pencipta dan pengembang utama website Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA).
              Dengan keahlian di berbagai bidang teknologi, desain, dan ilmu terapan,
              website ini dibuat sebagai contoh edukasi dan eksplorasi keilmuan.
            </p>
            <Button asChild>
              <Link href="https://www.linkedin.com/in/mtrinanda/" target="_blank" rel="noopener noreferrer">
                Lihat Profil LinkedIn
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </StaticContentPage>
  );
}