import { NextRequest, NextResponse } from 'next/server';

interface CrudData {
  date: string;
  nameDetails: string;
  address: string;
  phone: string;
  vendor: string;
  team: string;
  mode: string;
  pb: string;
  dc: string;
  pbAmt: number;
  dcAmt: number;
  tsb: string;
  cid: string;
  status: string;
}

export async function POST(request: NextRequest) {
  const data: CrudData = await request.json();
  // Implement data creation logic here
  return NextResponse.json({ success: true });
}
