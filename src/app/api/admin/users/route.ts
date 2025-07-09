import { NextResponse } from 'next/server';
import { getAllUsersWithProfiles } from '@/lib/users';
import { createSupabaseServerClient } from '@/integrations/supabase/server-actions'; // Use new server client

export async function GET() {
  const supabase = createSupabaseServerClient(); // Create server-side client
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

  const users = await getAllUsersWithProfiles();
  return NextResponse.json({ data: users });
}

// POST route is not implemented here as users typically register themselves.
// If admin-created users are needed, this can be added.