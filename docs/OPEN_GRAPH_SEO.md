# Open Graph dan SEO Implementation

Dokumentasi ini menjelaskan implementasi fitur Open Graph, Twitter Cards, dan SEO yang telah ditambahkan ke website JIMEKA.

## 🚀 Fitur yang Ditambahkan

### 1. **Open Graph Meta Tags**
- ✅ og:title - Judul halaman yang dioptimalkan
- ✅ og:description - Deskripsi halaman yang menarik
- ✅ og:image - Gambar dinamis untuk setiap halaman
- ✅ og:url - URL canonical untuk setiap halaman
- ✅ og:type - Tipe konten (website/article)
- ✅ og:site_name - Nama website
- ✅ og:locale - Bahasa konten (id_ID)

### 2. **Twitter Cards**
- ✅ twitter:card - Summary large image
- ✅ twitter:site - Handle Twitter website
- ✅ twitter:creator - Handle Twitter creator
- ✅ twitter:title - Judul untuk Twitter
- ✅ twitter:description - Deskripsi untuk Twitter
- ✅ twitter:image - Gambar untuk Twitter

### 3. **Dynamic Open Graph Images**
- ✅ API endpoint `/api/og` untuk generate gambar dinamis
- ✅ Gambar berbeda untuk setiap halaman
- ✅ Ukuran optimal 1200x630px
- ✅ Desain konsisten dengan branding JIMEKA

### 4. **Structured Data (JSON-LD)**
- ✅ Organization schema untuk website
- ✅ WebSite schema dengan search action
- ✅ ScholarlyArticle schema untuk artikel
- ✅ Breadcrumb navigation

### 5. **SEO Optimization**
- ✅ Meta title dan description yang dioptimalkan
- ✅ Keywords yang relevan
- ✅ Canonical URLs
- ✅ Robots meta tags
- ✅ Language tags (hreflang)

### 6. **Sitemap dan Robots**
- ✅ Sitemap.xml dinamis
- ✅ Robots.txt dengan aturan yang tepat
- ✅ Blocking AI crawlers yang tidak diinginkan

## 📁 File Structure

```
src/
├── lib/
│   └── metadata.ts              # Utility functions untuk metadata
├── app/
│   ├── api/og/route.tsx        # Dynamic OG image generator
│   ├── sitemap.ts              # Dynamic sitemap
│   ├── robots.ts               # Robots.txt configuration
│   ├── layout.tsx              # Root layout dengan metadata
│   ├── page.tsx                # Homepage metadata
│   ├── about/page.tsx          # About page metadata
│   ├── articles/[id]/page.tsx  # Article page metadata
│   └── announcements/[id]/page.tsx # Announcement metadata
├── components/
│   └── StructuredData.tsx      # Component untuk JSON-LD
└── public/
    └── images/
        ├── og-default.png      # Default OG image
        └── og-default.svg      # SVG version
```

## 🛠️ Cara Menggunakan

### 1. **Menambah Metadata ke Halaman Baru**

```typescript
import { generateMetadata as generateSEOMetadata, SITE_CONFIG } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Judul Halaman",
  description: "Deskripsi halaman yang menarik dan informatif",
  keywords: ["keyword1", "keyword2", "keyword3"],
  canonical: `${SITE_CONFIG.url}/path-halaman`,
  openGraph: {
    type: "website", // atau "article"
    image: `${SITE_CONFIG.url}/api/og?title=${encodeURIComponent("Judul")}&subtitle=${encodeURIComponent("Subtitle")}&type=website`,
  },
});
```

### 2. **Menggunakan Dynamic OG Images**

URL format untuk generate OG image:
```
/api/og?title=JUDUL&subtitle=SUBTITLE&type=TYPE
```

Parameter:
- `title`: Judul utama (required)
- `subtitle`: Subtitle/deskripsi (optional)
- `type`: website/article (optional, default: website)

### 3. **Menambah Structured Data**

```typescript
import { StructuredData } from "@/components/StructuredData";
import { generateArticleStructuredData } from "@/lib/metadata";

// Di dalam component
const structuredData = generateArticleStructuredData({
  title: "Judul Artikel",
  abstract: "Abstrak artikel",
  authors: ["Penulis 1", "Penulis 2"],
  publishedDate: "2024-01-01",
  url: "https://jimeka.vercel.app/articles/123",
});

return (
  <>
    <StructuredData data={structuredData} />
    {/* Konten halaman */}
  </>
);
```

## 🔧 Konfigurasi

### Environment Variables
Pastikan variabel berikut ada di `.env.local`:

```env
NEXT_PUBLIC_SITE_URL="https://jimeka.vercel.app"
```

### Site Configuration
Edit konfigurasi di `src/lib/metadata.ts`:

```typescript
export const SITE_CONFIG = {
  name: "Jurnal Ilmiah Mahasiswa Ekonomi Akuntansi (JIMEKA)",
  shortName: "JIMEKA",
  description: "Deskripsi website...",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://jimeka.vercel.app",
  // ... konfigurasi lainnya
};
```

## 📊 Testing dan Validation

### Tools untuk Testing:
1. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
4. **Google Rich Results Test**: https://search.google.com/test/rich-results
5. **Schema.org Validator**: https://validator.schema.org/

### Cara Test:
1. Deploy website ke production
2. Test URL di tools di atas
3. Periksa preview di social media
4. Validasi structured data

## 🎯 Best Practices

### 1. **Open Graph Images**
- Ukuran: 1200x630px (rasio 1.91:1)
- Format: PNG atau JPG
- Ukuran file: < 1MB
- Teks harus terbaca di ukuran kecil

### 2. **Meta Descriptions**
- Panjang: 150-160 karakter
- Menarik dan informatif
- Mengandung keyword utama
- Call-to-action yang jelas

### 3. **Titles**
- Panjang: 50-60 karakter
- Keyword di awal
- Brand name di akhir
- Unik untuk setiap halaman

### 4. **Structured Data**
- Gunakan schema yang relevan
- Test dengan Google Rich Results
- Update sesuai perubahan konten
- Hindari markup yang berlebihan

## 🚀 Deployment

Setelah implementasi:

1. **Build dan test lokal**:
   ```bash
   npm run build
   npm start
   ```

2. **Deploy ke Vercel**:
   ```bash
   vercel --prod
   ```

3. **Verify di production**:
   - Test OG images: `https://your-domain.com/api/og?title=Test`
   - Check sitemap: `https://your-domain.com/sitemap.xml`
   - Check robots: `https://your-domain.com/robots.txt`

## 📈 Monitoring

### Metrics to Track:
- Click-through rate dari social media
- Organic search traffic
- Rich snippets appearance
- Social media engagement
- Page load speed impact

### Tools:
- Google Search Console
- Google Analytics
- Social media analytics
- Core Web Vitals

## 🔄 Maintenance

### Regular Tasks:
- Update OG images untuk konten baru
- Monitor broken links di sitemap
- Update structured data sesuai schema terbaru
- Test social media previews
- Review dan update meta descriptions

---

**Note**: Implementasi ini mengikuti best practices terbaru untuk SEO dan social media optimization. Pastikan untuk selalu test di berbagai platform sebelum go-live.
