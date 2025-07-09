import { NextResponse } from 'next/server';
import { getAllArticles, insertArticle } from '@/lib/articles';
import { createSupabaseServerClient } from '@/integrations/supabase/server-actions';

export async function GET() {
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

  const articles = await getAllArticles();
  return NextResponse.json({ data: articles });
}

export async function POST(request: Request) {
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
  const { data, error } = await insertArticle(body);

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}