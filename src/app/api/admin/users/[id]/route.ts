import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/integrations/supabase/server';

// This file is now only for reference. PUT and DELETE operations are handled by Server Actions.
// The GET operation for /api/admin/users is in route.ts
// This file can be deleted if no other specific ID-based GET/POST is needed.

export async function PUT() {
  return NextResponse.json({ message: "PUT operation is now handled by Server Actions." }, { status: 200 });
}

export async function DELETE() {
  return NextResponse.json({ message: "DELETE operation is now handled by Server Actions." }, { status: 200 });
}