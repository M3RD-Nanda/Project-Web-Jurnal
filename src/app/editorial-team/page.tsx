import { StaticContentPage } from "@/components/StaticContentPage";

export default function EditorialTeamPage() {
  return (
    <StaticContentPage title="EDITORIAL TEAM">
      <p>
        Tim editorial Jurnal Ekonomi Bisnis dan Akuntansi Mahasiswa (JEBAKA)
        terdiri dari para akademisi dan peneliti terkemuka di bidang Ekonomi dan
        Akuntansi. Mereka berdedikasi untuk memastikan kualitas dan integritas
        setiap artikel yang diterbitkan.
      </p>
      <h3 className="text-2xl font-semibold mt-8">Editor-in-Chief:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>
          Muhammad Trinanda, S.Akun., Universitas Islam Negeri Sumatera Utara
        </li>
      </ul>
      <h3 className="text-2xl font-semibold mt-8">Associate Editors:</h3>
      <ul className="list-disc list-inside space-y-2">
        <li>Dr. Muhammad Fikri Aulia, BBA., Universiti Utara Malaysia</li>
        <li>Dr. Indra Ahmad Maulana, S.M., Universitas Islam Sumatera Utara</li>
        <li>Dr. Nadya Nayla Putri, S.IKOM., Universitas Siber Asia</li>
      </ul>
      <h3 className="text-2xl font-semibold mt-8">Editorial Board Members:</h3>
      <p>
        Daftar lengkap anggota dewan editorial dapat ditemukan di sini. Mereka
        adalah para ahli di berbagai sub-bidang Ekonomi dan Akuntansi, yang
        memberikan kontribusi berharga dalam proses peninjauan dan seleksi
        artikel.
      </p>
    </StaticContentPage>
  );
}
