import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  // Implement delete logic here
  return NextResponse.json({ success: true });
}
