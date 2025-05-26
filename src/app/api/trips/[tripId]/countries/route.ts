import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const countrySchema = z.object({
  code: z.string().length(2),
  name: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: {
        id: params.tripId,
        userId,
      },
    });

    if (!trip) {
      return new NextResponse("Trip not found", { status: 404 });
    }

    const body = await request.json();
    const { code, name } = countrySchema.parse(body);

    const country = await prisma.country.create({
      data: {
        code,
        name,
        tripId: params.tripId,
      },
    });

    return NextResponse.json(country);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("Error adding country:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
