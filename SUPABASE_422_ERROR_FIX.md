# Perbaikan Error 422 Supabase Signup

## Masalah
Error 422 (Unprocessable Content) terjadi saat melakukan signup di halaman `/register`. Error ini disebabkan oleh beberapa faktor:

1. **Konfigurasi Auth Supabase**: `uri_allow_list` kosong dan konfigurasi redirect URL tidak tepat
2. **Database Function**: Function `handle_new_user` mengharapkan metadata `first_name` dan `last_name` dari `raw_user_meta_data` tetapi Auth UI tidak mengirimkan data ini
3. **Auth UI Limitation**: Supabase Auth UI tidak mudah untuk mengirimkan custom metadata

## Solusi yang Diterapkan

### 1. Update Konfigurasi Supabase Auth
```bash
# Melalui Supabase Management API
PATCH /v1/projects/xlvnaempudqlrdonfzun/config/auth
{
  "site_url": "http://localhost:3000",
  "uri_allow_list": "http://localhost:3000,http://localhost:3000/**,https://project-web-jurnal.vercel.app,https://project-web-jurnal.vercel.app/**"
}
```

### 2. Perbaikan Database Function
Updated function `handle_new_user` untuk menangani kasus ketika metadata tidak ada:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$ 
BEGIN 
  INSERT INTO public.profiles (id, first_name, last_name, role) 
  VALUES ( 
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'first_name', 'User'), 
    COALESCE(new.raw_user_meta_data ->> 'last_name', ''), 
    'user' 
  ); 
  RETURN new; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Perubahan:**
- Menggunakan `COALESCE()` untuk memberikan default value jika metadata tidak ada
- `first_name` default ke 'User' jika kosong
- `last_name` default ke string kosong jika tidak ada

### 3. Custom Signup Form
Mengganti Supabase Auth UI dengan custom form yang dapat mengirimkan metadata dengan benar:

**File**: `src/app/register/page.tsx`

**Fitur:**
- Form custom dengan field nama depan dan belakang
- Validasi password dan konfirmasi password
- Pengiriman metadata yang tepat ke Supabase
- Error handling yang lebih baik
- UI yang konsisten dengan design system

**Kode utama:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      first_name: formData.first_name || "User",
      last_name: formData.last_name || "",
    },
    emailRedirectTo: typeof window !== "undefined" 
      ? `${window.location.origin}/` 
      : "http://localhost:3000/",
  },
});
```

### 4. Perbaikan Redirect URL
- Menambahkan trailing slash pada redirect URL
- Memastikan konsistensi antara client dan server URL

## Hasil Perbaikan

### ✅ Error 422 Teratasi
- Signup sekarang berfungsi dengan benar
- Metadata user tersimpan dengan proper
- Database trigger berjalan tanpa error

### ✅ User Experience Improved
- Form yang lebih intuitif dan user-friendly
- Validasi yang lebih baik
- Error messages yang informatif
- Loading states yang jelas

### ✅ Data Integrity
- Profile otomatis dibuat saat signup
- Default values yang aman
- Proper error handling

## Testing
1. Buka `http://localhost:3000/register`
2. Isi form dengan data valid
3. Submit form
4. Verifikasi bahwa:
   - Tidak ada error 422
   - User berhasil dibuat
   - Profile tersimpan di database
   - Redirect ke login page

## Catatan Deployment
Pastikan environment variables berikut sudah diset di production:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xlvnaempudqlrdonfzun.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Dan update `uri_allow_list` di Supabase untuk include production URL.
