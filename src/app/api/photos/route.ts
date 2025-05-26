import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    console.log("API: Received photo upload request");

    const body = await request.json();
    console.log("API: Request body:", body);

    const photo = await prisma.photo.create({
      data: {
        url: body.url,
        caption: body.caption,
        tripId: body.tripId,
        takenAt: new Date().toISOString(),
      },
    });

    console.log("API: Created photo:", photo);
    return NextResponse.json(photo);
  } catch (error) {
    console.error("API Error creating photo:", error);
    return new NextResponse("Failed to create photo", { status: 500 });
  }
}
