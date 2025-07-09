import { NextResponse } from 'next/server';
import { getAllAnnouncements, insertAnnouncement } from '@/lib/announcements';
import { supabase } from '@/integrations/supabase/client';

export async function GET() {
  const announcements = await getAllAnnouncements();
  return NextResponse.json({ data: announcements });
}

export async function POST(request: Request) {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return NextResponse.json({ error: { message: 'Forbidden: Not an admin' } }, { status: 403 });
  }

  const body = await request.json();
  const { data, error } = await insertAnnouncement(body);

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}