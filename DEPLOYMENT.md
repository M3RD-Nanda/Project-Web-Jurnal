# Deployment Guide - Jurnal Website

## Masalah Grafik VISITORS di Vercel

### Penyebab Masalah
1. **SSR Issues**: Recharts tidak kompatibel dengan Server-Side Rendering
2. **Hydration Mismatch**: Perbedaan rendering antara server dan client
3. **Environment Variables**: Konfigurasi Supabase yang berbeda di production

### Solusi yang Diterapkan

#### 1. Dynamic Import dengan Fallback
- Menggunakan `dynamic` import untuk VisitorChart
- Fallback ke VisitorChartSimple jika gagal load
- Disable SSR untuk komponen chart

#### 2. Improved Error Handling
- Logging debug untuk troubleshooting
- Mock data sebagai fallback
- Better error messages

#### 3. Environment Configuration
- Vercel.json untuk build optimization
- Next.js config untuk better compatibility
- Environment variables setup

### Deployment Steps

#### 1. Environment Variables di Vercel
Pastikan environment variables berikut sudah diset:
```
NEXT_PUBLIC_SUPABASE_URL=https://xlvnaempudqlrdonfzun.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 2. Build Settings di Vercel
- Framework Preset: Next.js
- Build Command: `pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`

#### 3. Verifikasi Database
Pastikan tabel `page_visits` ada di Supabase dengan struktur:
```sql
CREATE TABLE page_visits (
  id SERIAL PRIMARY KEY,
  path TEXT,
  visited_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. Testing
1. Deploy ke Vercel
2. Check browser console untuk error logs
3. Verify chart loads atau fallback ke simple chart
4. Test data fetching dari Supabase

### Troubleshooting

#### Jika Chart Masih Tidak Muncul:
1. Check browser console untuk error messages
2. Verify environment variables di Vercel dashboard
3. Check Supabase connection dan RLS policies
4. Fallback chart (VisitorChartSimple) harus tetap muncul

#### Debug Commands:
```javascript
// Di browser console
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
```

### Files yang Dimodifikasi:
- `src/components/VisitorChart.tsx` - Dynamic import + error handling
- `src/components/VisitorChartSimple.tsx` - Fallback component
- `src/lib/analytics.ts` - Better error handling + logging
- `src/lib/debug.ts` - Debug utilities
- `vercel.json` - Deployment configuration
- `next.config.ts` - Build optimization

### Monitoring
- Check Vercel function logs
- Monitor Supabase dashboard untuk query errors
- Browser console untuk client-side errors
