import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");

  if (!origin || !destination) {
    return NextResponse.json({ error: "Origin and destination parameters are required" }, { status: 400 });
  }

  try {
    const tokenResponse = await fetch("http://localhost:3000/api/token");
    if (!tokenResponse.ok) {
      console.error("Error fetching token:", tokenResponse.statusText);
      return NextResponse.json({ error: "Failed to retrieve token" }, { status: tokenResponse.status });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("No access token in token response");
      return NextResponse.json({ error: "Token retrieval error" }, { status: 500 });
    }

    const response = await fetch(`https://api.olamaps.io/routing/v1/distanceMatrix?origins=${origin}&destinations=${destination}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Distance Matrix API Error:", response.statusText, errorText);
      return NextResponse.json({ error: "Distance Matrix request failed" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error in distance-matrix route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
