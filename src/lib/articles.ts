export interface Article {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  fullContent: string;
  publicationDate: string;
  keywords: string[];
}

// Data dummy untuk artikel
const dummyArticles: Article[] = [
  {
    id: "analisis-dampak-kebijakan-moneter",
    title: "Analisis Dampak Kebijakan Moneter Terhadap Inflasi di Indonesia",
    authors: "Dr. Budi Santoso, M.E.",
    abstract: "Penelitian ini mengkaji pengaruh kebijakan moneter Bank Indonesia terhadap tingkat inflasi di Indonesia, dengan fokus pada periode 2010-2023. Hasil penelitian menunjukkan bahwa suku bunga acuan memiliki dampak signifikan terhadap pengendalian inflasi.",
    fullContent: `
      <p><strong>Pendahuluan</strong></p>
      <p>Inflasi merupakan salah satu indikator makroekonomi penting yang selalu menjadi perhatian utama Bank Indonesia. Kebijakan moneter, melalui instrumen seperti suku bunga acuan, operasi pasar terbuka, dan giro wajib minimum, dirancang untuk menjaga stabilitas harga dan mendukung pertumbuhan ekonomi yang berkelanjutan.</p>
      <p><strong>Metodologi</strong></p>
      <p>Penelitian ini menggunakan pendekatan kuantitatif dengan data time series bulanan dari tahun 2010 hingga 2023. Metode analisis yang digunakan adalah Vector Autoregression (VAR) untuk mengidentifikasi hubungan kausalitas dan dampak dinamis antar variabel.</p>
      <p><strong>Hasil dan Pembahasan</strong></p>
      <p>Hasil estimasi model VAR menunjukkan bahwa kenaikan suku bunga acuan (BI Rate/BI7DRR) secara signifikan mampu meredam laju inflasi dalam jangka menengah. Namun, terdapat lag waktu dalam transmisi kebijakan moneter ke perekonomian riil.</p>
      <p><strong>Kesimpulan</strong></p>
      <p>Kebijakan moneter Bank Indonesia terbukti efektif dalam mengendalikan inflasi di Indonesia, meskipun tantangan eksternal dan internal tetap ada. Diperlukan koordinasi kebijakan yang erat antara moneter dan fiskal untuk mencapai stabilitas ekonomi yang optimal.</p>
    `,
    publicationDate: "15 Juni 2024",
    keywords: ["Kebijakan Moneter", "Inflasi", "Bank Indonesia", "Ekonomi Makro"],
  },
  {
    id: "peran-umkm-ekonomi-digital",
    title: "Peran UMKM dalam Perekonomian Digital: Studi Kasus di Medan",
    authors: "Prof. Siti Aminah, Ph.D.",
    abstract: "Studi ini menganalisis kontribusi Usaha Mikro, Kecil, dan Menengah (UMKM) dalam ekosistem ekonomi digital di Provinsi Medan, serta tantangan dan peluang yang dihadapi.",
    fullContent: `
      <p><strong>Pendahuluan</strong></p>
      <p>Transformasi digital telah mengubah lanskap bisnis secara drastis, termasuk bagi UMKM. Di Provinsi Medan, UMKM memiliki potensi besar untuk berkontribusi pada perekonomian lokal melalui adopsi teknologi digital.</p>
      <p><strong>Metodologi</strong></p>
      <p>Penelitian ini menggunakan metode kualitatif dengan pendekatan studi kasus, melibatkan wawancara mendalam dengan pemilik UMKM di beberapa kota di Medan yang telah mengadopsi platform digital.</p>
      <p><strong>Hasil dan Pembahasan</strong></p>
      <p>Ditemukan bahwa UMKM yang memanfaatkan platform e-commerce dan media sosial mengalami peningkatan penjualan dan jangkauan pasar. Namun, tantangan seperti literasi digital yang rendah dan akses modal masih menjadi hambatan.</p>
      <p><strong>Kesimpulan</strong></p>
      <p>Pemerintah dan pemangku kepentingan perlu meningkatkan program pelatihan literasi digital dan memfasilitasi akses permodalan bagi UMKM agar dapat bersaing di era ekonomi digital.</p>
    `,
    publicationDate: "20 Mei 2024",
    keywords: ["UMKM", "Ekonomi Digital", "Medan", "E-commerce"],
  },
  {
    id: "efektivitas-program-csr",
    title: "Efektivitas Program CSR Perusahaan Terhadap Kesejahteraan Masyarakat Lokal",
    authors: "Dra. Fitriani, Ak., M.Si.",
    abstract: "Penelitian ini mengevaluasi efektivitas program Corporate Social Responsibility (CSR) beberapa perusahaan di wilayah tertentu terhadap peningkatan kesejahteraan masyarakat lokal.",
    fullContent: `
      <p><strong>Pendahuluan</strong></p>
      <p>Corporate Social Responsibility (CSR) telah menjadi bagian integral dari strategi bisnis perusahaan modern. Program CSR diharapkan tidak hanya meningkatkan citra perusahaan tetapi juga memberikan dampak positif yang nyata bagi masyarakat sekitar.</p>
      <p><strong>Metodologi</strong></p>
      <p>Studi ini menggunakan pendekatan campuran (mixed-methods), menggabungkan survei kuantitatif kepada penerima manfaat program CSR dan wawancara kualitatif dengan manajemen perusahaan serta tokoh masyarakat.</p>
      <p><strong>Hasil dan Pembahasan</strong></p>
      <p>Hasil menunjukkan bahwa program CSR yang terencana dengan baik dan melibatkan partisipasi masyarakat cenderung lebih efektif dalam meningkatkan kesejahteraan. Indikator kesejahteraan yang diamati meliputi peningkatan pendapatan, akses pendidikan, dan kesehatan.</p>
      <p><strong>Kesimpulan</strong></p>
      <p>Efektivitas program CSR sangat bergantung pada keselarasan antara tujuan perusahaan dan kebutuhan masyarakat. Perusahaan disarankan untuk melakukan asesmen kebutuhan yang komprehensif sebelum merancang program CSR.</p>
    `,
    publicationDate: "10 April 2024",
    keywords: ["CSR", "Kesejahteraan Masyarakat", "Perusahaan", "Dampak Sosial"],
  },
  {
    id: "dampak-transformasi-digital-umkm",
    title: "Dampak Transformasi Digital pada Sektor UMKM",
    authors: "A. Rahman, B. Lestari",
    abstract: "Artikel ini membahas bagaimana transformasi digital mempengaruhi sektor UMKM di Indonesia, dengan fokus pada adopsi teknologi dan dampaknya terhadap pertumbuhan bisnis.",
    fullContent: `
      <p><strong>Pendahuluan</strong></p>
      <p>Sektor UMKM merupakan tulang punggung perekonomian Indonesia. Dengan pesatnya perkembangan teknologi digital, UMKM dihadapkan pada peluang sekaligus tantangan untuk beradaptasi dan bertransformasi.</p>
      <p><strong>Metodologi</strong></p>
      <p>Penelitian ini menggunakan survei daring terhadap 500 UMKM di berbagai sektor di Indonesia untuk mengumpulkan data tentang tingkat adopsi teknologi digital, manfaat yang dirasakan, dan hambatan yang dihadapi.</p>
      <p><strong>Hasil dan Pembahasan</strong></p>
      <p>Mayoritas UMKM telah mulai mengadopsi platform media sosial untuk pemasaran, namun adopsi teknologi yang lebih kompleks seperti sistem manajemen inventaris atau analitik data masih rendah. UMKM yang berinvestasi dalam transformasi digital menunjukkan pertumbuhan pendapatan yang lebih tinggi.</p>
      <p><strong>Kesimpulan</strong></p>
      <p>Pemerintah dan penyedia teknologi perlu berkolaborasi untuk menyediakan infrastruktur, pelatihan, dan dukungan finansial yang memadai agar UMKM dapat sepenuhnya memanfaatkan potensi ekonomi digital.</p>
    `,
    publicationDate: "30 Juni 2024",
    keywords: ["Transformasi Digital", "UMKM", "Ekonomi", "Teknologi"],
  },
  {
    id: "analisis-efektivitas-kebijakan-subsidi-energi",
    title: "Analisis Efektivitas Kebijakan Subsidi Energi",
    authors: "C. Wijaya, D. Putri",
    abstract: "Studi ini menganalisis efektivitas kebijakan subsidi energi pemerintah dan dampaknya terhadap perekonomian nasional serta kesejahteraan masyarakat.",
    fullContent: `
      <p><strong>Pendahuluan</strong></p>
      <p>Kebijakan subsidi energi di Indonesia telah menjadi topik perdebatan yang berkelanjutan, dengan tujuan utama untuk menjaga daya beli masyarakat dan stabilitas harga energi. Namun, efektivitas dan dampak jangka panjangnya perlu dievaluasi secara mendalam.</p>
      <p><strong>Metodologi</strong></p>
      <p>Penelitian ini menggunakan analisis ekonometrik dengan data panel dari berbagai provinsi di Indonesia untuk mengukur dampak subsidi energi terhadap konsumsi, inflasi, dan distribusi pendapatan.</p>
      <p><strong>Hasil dan Pembahasan</strong></p>
      <p>Hasil penelitian menunjukkan bahwa subsidi energi memang mampu menekan inflasi dan menjaga daya beli, namun seringkali tidak tepat sasaran dan membebani anggaran negara. Terdapat indikasi bahwa subsidi lebih banyak dinikmati oleh kelompok masyarakat menengah ke atas.</p>
      <p><strong>Kesimpulan</strong></p>
      <p>Diperlukan reformasi kebijakan subsidi energi yang lebih terarah dan berbasis target, serta diversifikasi sumber energi untuk mengurangi ketergantungan pada subsidi dan mencapai keberlanjutan fiskal.</p>
    `,
    publicationDate: "30 Juni 2024",
    keywords: ["Subsidi Energi", "Kebijakan Fiskal", "Ekonomi Nasional", "Kesejahteraan"],
  },
  {
    id: "peran-akuntansi-forensik-pencegahan-fraud",
    title: "Peran Akuntansi Forensik dalam Pencegahan Fraud",
    authors: "E. Susanto, F. Handayani",
    abstract: "Penelitian ini mengeksplorasi peran akuntansi forensik sebagai alat penting dalam mendeteksi dan mencegah praktik fraud di berbagai organisasi.",
    fullContent: `
      <p><strong>Pendahuluan</strong></p>
      <p>Fraud atau kecurangan merupakan ancaman serius bagi integritas dan keberlanjutan organisasi. Akuntansi forensik muncul sebagai disiplin ilmu yang menggabungkan akuntansi, audit, dan investigasi untuk mengungkap dan mencegah fraud.</p>
      <p><strong>Metodologi</strong></p>
      <p>Penelitian ini menggunakan pendekatan studi literatur dan analisis kasus-kasus fraud yang telah terungkap untuk mengidentifikasi peran dan teknik akuntansi forensik dalam pencegahan fraud.</p>
      <p><strong>Hasil dan Pembahasan</strong></p>
      <p>Akuntansi forensik tidak hanya berperan dalam mendeteksi fraud setelah terjadi, tetapi juga sangat efektif dalam pencegahan melalui implementasi kontrol internal yang kuat, analisis risiko fraud, dan pelatihan kesadaran fraud bagi karyawan.</p>
      <p><strong>Kesimpulan</strong></p>
      <p>Integrasi akuntansi forensik ke dalam sistem tata kelola perusahaan dapat secara signifikan mengurangi risiko fraud dan meningkatkan akuntabilitas. Organisasi perlu berinvestasi dalam pengembangan keahlian akuntansi forensik.</p>
    `,
    publicationDate: "30 Juni 2024",
    keywords: ["Akuntansi Forensik", "Fraud", "Pencegahan", "Audit"],
  },
];

export function getArticleById(id: string): Article | undefined {
  return dummyArticles.find((article) => article.id === id);
}

export function getAllArticles(): Article[] {
  return dummyArticles;
}