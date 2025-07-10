import { NextResponse } from 'next/server';
import { getAllAnnouncements, insertAnnouncement } from '@/lib/announcements';
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

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: { message: 'Unauthorized: No valid Authorization header' } }, { status: 401 });
  }

  const accessToken = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !user) {
    console.error("API Admin Announcements POST: Auth error or no user:", authError?.message);
    return NextResponse.json({ error: { message: 'Unauthorized: Invalid token' } }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    console.error("API Admin Announcements POST: Profile error or not admin:", profileError?.message || "Role not admin");
    return NextResponse.json({ error: { message: 'Forbidden: Not an admin' } }, { status: 403 });
  }

  const body = await request.json();
  const { data, error } = await insertAnnouncement(body);

  if (error) {
    console.error("API Admin Announcements POST: Error inserting announcement:", error.message);
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}