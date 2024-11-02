import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get("input");

  if (!input) {
    return NextResponse.json({ error: "Input parameter is required" }, { status: 400 });
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

    const response = await fetch(`https://api.olamaps.io/places/v1/autocomplete?input=${input}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Autocomplete API Error:", response.statusText, errorText);
      return NextResponse.json({ error: "Autocomplete request failed" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error in autocomplete route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
