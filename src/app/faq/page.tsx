import { StaticContentPage } from "@/components/StaticContentPage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
            <AccordionContent className="text-base text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </StaticContentPage>
  );
}