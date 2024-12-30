import { NextResponse } from 'next/server';

interface CrudData {
  id: number;
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

export async function GET() {
  // Fetch data from your database or other source
  const data: CrudData[] = []; // Replace with actual data fetching logic
  
  return NextResponse.json(data);
}
