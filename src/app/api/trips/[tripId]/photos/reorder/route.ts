import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reorderSchema = z.object({
  photos: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
    })
  ),
});

export async function PUT(
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
    const { photos } = reorderSchema.parse(body);

    // Update all photos in a transaction
    await prisma.$transaction(
      photos.map((photo) =>
        prisma.photo.update({
          where: {
            id: photo.id,
            tripId: params.tripId, // Extra safety check
          },
          data: {
            order: photo.order,
          },
        })
      )
    );

    return new NextResponse("Photos reordered successfully");
  } catch (error) {
    console.error("Error reordering photos:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    );
  }
}
