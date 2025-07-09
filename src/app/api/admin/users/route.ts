import { NextResponse } from 'next/server';
import { getAllUsersWithProfiles } from '@/lib/users';
import { createSupabaseServerClient } from '@/integrations/supabase/server-actions';

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  console.log('API Admin Users GET: Session ->', session);
  console.log('API Admin Users GET: Session Error ->', sessionError);

  if (!session) {
    console.log('API Admin Users GET: Unauthorized - No session');
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  console.log('API Admin Users GET: Profile ->', profile);
  console.log('API Admin Users GET: Profile Error ->', profileError);

  if (profileError || profile?.role !== 'admin') {
    console.log('API Admin Users GET: Forbidden - Not an admin or profile error');
    return NextResponse.json({ error: { message: 'Forbidden: Not an admin' } }, { status: 403 });
  }

  const users = await getAllUsersWithProfiles();
  console.log('API Admin Users GET: Successfully fetched users');
  return NextResponse.json({ data: users });
}

// POST route is not implemented here as users typically register themselves.
// If admin-created users are needed, this can be added.