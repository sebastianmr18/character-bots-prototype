import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(
      `${process.env.BACKEND_URL}/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      console.log("RAG Proxy Backend Error:", await response.text());
      throw new Error("Backend RAG error");
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("RAG Proxy Error:", error);

    return NextResponse.json(
      { context: "", error: "RAG unavailable" },
      { status: 500 }
    );
  }
}
