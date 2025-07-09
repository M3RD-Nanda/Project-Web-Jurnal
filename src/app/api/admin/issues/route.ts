import { NextResponse } from 'next/server';
import { getAllIssues, insertIssue } from '@/lib/issues';
import { supabaseAdmin } from '@/integrations/supabase/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: { message: 'Unauthorized: No valid Authorization header' } }, { status: 401 });
  }

  const accessToken = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !user) {
    return NextResponse.json({ error: { message: 'Unauthorized: Invalid token' } }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return NextResponse.json({ error: { message: 'Forbidden: Not an admin' } }, { status: 403 });
  }

  const issues = await getAllIssues();
  return NextResponse.json({ data: issues });
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: { message: 'Unauthorized: No valid Authorization header' } }, { status: 401 });
  }

  const accessToken = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !user) {
    return NextResponse.json({ error: { message: 'Unauthorized: Invalid token' } }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return NextResponse.json({ error: { message: 'Forbidden: Not an admin' } }, { status: 403 });
  }

  const body = await request.json();
  const { data, error } = await insertIssue(body);

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}