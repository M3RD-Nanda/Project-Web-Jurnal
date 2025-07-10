# WalletConnect Setup Guide

## Mendapatkan Project ID WalletConnect

Untuk menggunakan fitur wallet crypto dengan benar, Anda perlu mendapatkan Project ID yang valid dari WalletConnect.

### Langkah-langkah:

1. **Kunjungi WalletConnect Cloud**
   - Buka https://cloud.walletconnect.com
   - Klik "Sign Up" atau "Sign In" jika sudah punya akun

2. **Buat Project Baru**
   - Setelah login, klik "Create Project"
   - Isi informasi project:
     - **Project Name**: "Jurnal Website" (atau nama yang Anda inginkan)
     - **Project Description**: "Website jurnal dengan fitur crypto wallet"
     - **Project URL**: URL website Anda (bisa localhost untuk development)

3. **Dapatkan Project ID**
   - Setelah project dibuat, Anda akan melihat **Project ID**
   - Copy Project ID tersebut

4. **Update Environment Variables**
   - Buka file `.env.local`
   - Uncomment dan update baris berikut:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-actual-project-id-here"
   ```
   - Ganti `your-actual-project-id-here` dengan Project ID yang Anda dapatkan

5. **Restart Development Server**
   - Stop server development (Ctrl+C)
   - Jalankan kembali: `npm run dev` atau `pnpm dev`

### Verifikasi Setup

Setelah setup selesai, Anda seharusnya tidak lagi melihat error 403 di console browser.

### Troubleshooting

**Error 403 Forbidden:**
- Pastikan Project ID sudah benar
- Pastikan domain/URL sudah terdaftar di WalletConnect project settings

**Error 400 Bad Request:**
- Pastikan Project ID format UUID yang valid
- Pastikan tidak ada typo dalam Project ID

### Development vs Production

- **Development**: Gunakan `localhost:3000` atau port yang Anda gunakan
- **Production**: Pastikan domain production sudah ditambahkan ke project settings

### Keamanan

- Jangan commit Project ID ke repository public
- Gunakan environment variables untuk menyimpan Project ID
- Project ID bersifat public dan aman untuk digunakan di client-side

## Status Saat Ini

Saat ini aplikasi menggunakan konfigurasi fallback yang aman untuk development. 
Beberapa fitur wallet mungkin terbatas sampai Project ID yang valid dikonfigurasi.

### Fitur yang Tersedia Tanpa Project ID:
- ✅ Basic wallet connection (MetaMask, browser wallets)
- ✅ Chain switching
- ✅ Balance display
- ✅ Transaction signing

### Fitur yang Memerlukan Project ID:
- ❌ WalletConnect mobile wallets
- ❌ QR code scanning
- ❌ Advanced wallet features
- ❌ Analytics dan monitoring
