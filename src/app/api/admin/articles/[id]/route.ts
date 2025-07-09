import { NextResponse } from 'next/server';
import { updateArticle, deleteArticle } from '@/lib/articles';
import { createSupabaseServerClient } from '@/integrations/supabase/server-actions';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = createSupabaseServerClient();
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
  const { data, error } = await updateArticle(id, body);

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = createSupabaseServerClient();
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

  const { success, error } = await deleteArticle(id);

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

  return NextResponse.json({ success });
}