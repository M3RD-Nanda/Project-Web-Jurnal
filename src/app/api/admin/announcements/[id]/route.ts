import { NextResponse } from "next/server";

// This file is now only for reference. PUT and DELETE operations are handled by Server Actions.
// The GET and POST operations for /api/admin/announcements are in route.ts
// This file can be deleted if no other specific ID-based GET/POST is needed.

// Example of how you might have handled GET by ID if needed, but it's not the current issue.
// export async function GET(request: Request, context: any) {
//   const { id } = context.params;
//   const authHeader = request.headers.get('Authorization');

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return NextResponse.json({ error: { message: 'Unauthorized: No valid Authorization header' } }, { status: 401 });
//   }

//   const accessToken = authHeader.replace('Bearer ', '');
//   const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

//   if (authError || !user) {
//     console.error("API Admin Announcements GET by ID: Auth error or no user:", authError?.message);
//     return NextResponse.json({ error: { message: 'Unauthorized: Invalid token' } }, { status: 401 });
//   }

//   const { data: profile, error: profileError } = await supabaseAdmin
//     .from('profiles')
//     .select('role')
//     .eq('id', user.id)
//     .single();

//   if (profileError || profile?.role !== 'admin') {
//     console.error("API Admin Announcements GET by ID: Profile error or not admin:", profileError?.message || "Role not admin");
//     return NextResponse.json({ error: { message: 'Forbidden: Not an admin' } }, { status: 403 });
//   }

//   const announcement = await getAnnouncementById(id); // Assuming getAnnouncementById is still in lib
//   if (!announcement) {
//     return NextResponse.json({ error: { message: 'Announcement not found' } }, { status: 404 });
//   }
//   return NextResponse.json({ data: announcement });
// }

// PUT and DELETE are now handled by Server Actions.
// The API routes for these operations are no longer needed.
export async function PUT() {
  return NextResponse.json(
    { message: "PUT operation is now handled by Server Actions." },
    { status: 200 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: "DELETE operation is now handled by Server Actions." },
    { status: 200 }
  );
}
