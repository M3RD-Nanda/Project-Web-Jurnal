import { NextResponse } from "next/server";
import { updateArticle, deleteArticle } from "@/lib/articles";
import { supabaseAdmin } from "@/integrations/supabase/server";

export async function PUT(
  request: Request,
  context: any // Changed to any for diagnostic purposes
) {
  const { id } = context.params;
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("API Admin Articles PUT: Unauthorized - No valid Authorization header");
    return NextResponse.json(
      { error: { message: "Unauthorized: No valid Authorization header" } },
      { status: 401 }
    );
  }

  const accessToken = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !user) {
    console.error("API Admin Articles PUT: Auth error or no user:", authError);
    return NextResponse.json(
      { error: { message: "Unauthorized: Invalid token" } },
      { status: 401 }
    );
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    console.error("API Admin Articles PUT: Forbidden - Not an admin. User ID:", user.id, "Role:", profile?.role);
    return NextResponse.json(
      { error: { message: "Forbidden: Not an admin" } },
      { status: 403 }
    );
  }
  console.log("API Admin Articles PUT: User is admin. Proceeding with update.");

  const body = await request.json();
  const { data, error } = await updateArticle(id, body);

  if (error) {
    console.error("API Admin Articles PUT: Error updating article:", error);
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  request: Request,
  context: any // Changed to any for diagnostic purposes
) {
  const { id } = context.params;
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("API Admin Articles DELETE: Unauthorized - No valid Authorization header");
    return NextResponse.json(
      { error: { message: "Unauthorized: No valid Authorization header" } },
      { status: 401 }
    );
  }

  const accessToken = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (authError || !user) {
    console.error("API Admin Articles DELETE: Auth error or no user:", authError);
    return NextResponse.json(
      { error: { message: "Unauthorized: Invalid token" } },
      { status: 401 }
    );
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    console.error("API Admin Articles DELETE: Forbidden - Not an admin. User ID:", user.id, "Role:", profile?.role);
    return NextResponse.json(
      { error: { message: "Forbidden: Not an admin" } },
      { status: 403 }
    );
  }
  console.log("API Admin Articles DELETE: User is admin. Proceeding with deletion.");

  const { success, error } = await deleteArticle(id);

  if (error) {
    console.error("API Admin Articles DELETE: Error deleting article:", error);
    return NextResponse.json(
      { error: { message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success });
}