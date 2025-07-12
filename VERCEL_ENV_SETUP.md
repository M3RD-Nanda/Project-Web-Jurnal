# Vercel Environment Variables Setup

## 🚨 Perbaikan Error: AuthSessionMissingError

### Masalah
Error "AuthSessionMissingError: Auth session missing!" terjadi karena:
1. File `client.ts` menggunakan hardcoded credentials alih-alih environment variables
2. Mismatch antara environment variables di Vercel dan konfigurasi client

### ✅ Solusi yang Diterapkan
1. **Updated client.ts** - Sekarang menggunakan environment variables
2. **Updated server-actions.ts** - Konsistensi dalam penggunaan env vars
3. **Environment variables setup** - Panduan konfigurasi Vercel

## 🔧 Environment Variables yang Diperlukan di Vercel

Masuk ke Vercel Dashboard → Project Settings → Environment Variables dan tambahkan:

### Production Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xlvnaempudqlrdonfzun.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsdm5hZW1wdWRxbHJkb25menVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTA3NTQsImV4cCI6MjA2NzU2Njc1NH0.JICLB7UxI6qq-72nyLV4kizTs38NRDYtHSwTASa52K8
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
```

### Optional Variables
```env
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id_here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

## 📋 Langkah-langkah Setup di Vercel

### 1. Akses Environment Variables
1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project Anda
3. Klik tab "Settings"
4. Klik "Environment Variables" di sidebar

### 2. Tambahkan Variables
Untuk setiap environment variable:
1. Klik "Add New"
2. Masukkan **Name** (contoh: `NEXT_PUBLIC_SUPABASE_URL`)
3. Masukkan **Value** (contoh: `https://xlvnaempudqlrdonfzun.supabase.co`)
4. Pilih **Environment**: Production, Preview, Development (pilih semua)
5. Klik "Save"

### 3. Redeploy Project
Setelah menambahkan semua environment variables:
1. Kembali ke tab "Deployments"
2. Klik "..." pada deployment terbaru
3. Pilih "Redeploy"
4. Atau push commit baru ke repository

## 🔍 Verifikasi Setup

### 1. Check Environment Variables
Setelah deployment, buka browser console di website Anda dan jalankan:
```javascript
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
```

### 2. Test Authentication
1. Coba login ke website
2. Check browser console untuk error messages
3. Verify session persistence setelah refresh

### 3. Monitor Logs
Di Vercel Dashboard:
1. Klik tab "Functions"
2. Monitor real-time logs untuk error messages
3. Check untuk authentication-related errors

## 🚨 Troubleshooting

### Jika Masih Ada Error:
1. **Clear Browser Cache** - Hard refresh (Ctrl+Shift+R)
2. **Check Environment Variables** - Pastikan semua variables terisi
3. **Redeploy** - Force redeploy dari Vercel dashboard
4. **Check Supabase** - Verify database connection dan RLS policies

### Common Issues:
- **Missing SUPABASE_SERVICE_ROLE_KEY**: Diperlukan untuk admin operations
- **Wrong Environment**: Pastikan variables diset untuk Production
- **Typo in Variable Names**: Harus exact match dengan kode

## 📝 Notes
- Environment variables dengan prefix `NEXT_PUBLIC_` akan tersedia di client-side
- Variables tanpa prefix hanya tersedia di server-side
- Setelah mengubah environment variables, selalu redeploy project
- Jangan commit file `.env` ke repository untuk keamanan
