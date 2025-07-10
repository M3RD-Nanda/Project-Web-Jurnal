import { NextResponse } from 'next/server';
import { getAllAnnouncements } from '@/lib/announcements'; // Only GET is needed from lib
import { supabaseAdmin } from '@/integrations/supabase/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: { message: 'Unauthorized: No valid Authorization header' } }, { status: 401 });
  }

  const accessToken = authHeader.replace('Bearer ', '');

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !user) {
    console.error("API Admin Announcements GET: Auth error or no user:", authError?.message);
    return NextResponse.json({ error: { message: 'Unauthorized: Invalid token' } }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    console.error("API Admin Announcements GET: Profile error or not admin:", profileError?.message || "Role not admin");
    return NextResponse.json({ error: { message: 'Forbidden: Not an admin' } }, { status: 403 });
  }

  const announcements = await getAllAnnouncements();
  return NextResponse.json({ data: announcements });
}

// POST operation is now handled by Server Actions.
// The API route for POST is no longer needed.
export async function POST() {
  return NextResponse.json({ message: "POST operation is now handled by Server Actions." }, { status: 200 });
}