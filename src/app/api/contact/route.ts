import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Log the contact form submission (remove in production)
    console.log("Contact form submission:", { name, email, subject, message });

    // --- SIMULASI PENGIRIMAN EMAIL ---
    // Di lingkungan produksi, Anda akan mengintegrasikan layanan pengiriman email di sini,
    // seperti Nodemailer, SendGrid, Mailgun, atau layanan email lainnya.
    // Contoh:
    // await sendEmail({
    //   to: 'admin@jimeka.com',
    //   from: email,
    //   subject: `Pesan Kontak dari ${name}: ${subject}`,
    //   text: message,
    // });

    return NextResponse.json(
      { message: "Pesan berhasil diterima!" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error handling contact form submission:", error);
    return NextResponse.json(
      { error: "Gagal memproses pesan Anda." },
      { status: 500 }
    );
  }
}
