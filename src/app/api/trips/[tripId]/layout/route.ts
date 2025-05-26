import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const photoSchema = z.object({
  id: z.string(),
  url: z.string(),
  caption: z.string().optional(),
  takenAt: z.string().optional().nullable(),
});

const layoutSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      content: z.array(
        z.discriminatedUnion("type", [
          z.object({
            id: z.string(),
            type: z.enum(["single", "double", "triple"]),
            photos: z.array(photoSchema),
          }),
          z.object({
            id: z.string(),
            type: z.enum(["quote", "summary"]),
            content: z.string(),
            date: z.string(),
          }),
        ])
      ),
    })
  ),
});

export async function PUT(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const { userId } = await auth();
    const tripId = params.tripId;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { userId: true },
    });

    if (!trip) {
      return new NextResponse("Trip not found", { status: 404 });
    }

    if (trip.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    console.log("Received layout data:", JSON.stringify(body, null, 2));

    try {
      const validatedData = layoutSchema.parse(body);
      console.log(
        "Validated layout data:",
        JSON.stringify(validatedData, null, 2)
      );

      // Update or create layout
      const layout = await prisma.layout.upsert({
        where: { tripId },
        update: {
          content: validatedData.sections,
          updatedAt: new Date(),
        },
        create: {
          tripId,
          content: validatedData.sections,
        },
      });

      console.log("Layout saved successfully:", layout.id);
      return NextResponse.json(layout);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return new NextResponse(
        `Invalid layout data: ${(validationError as Error).message}`,
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error saving layout:", error);
    return new NextResponse(
      `Internal Server Error: ${(error as Error).message}`,
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const { userId } = await auth();
    const tripId = params.tripId;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify trip ownership or access
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { userId: true, shareLink: true },
    });

    if (!trip) {
      return new NextResponse("Trip not found", { status: 404 });
    }

    // Allow access if user owns the trip or if accessing via share link
    const isSharedView = request.headers
      .get("referer")
      ?.includes(trip.shareLink);
    if (!isSharedView && trip.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const layout = await prisma.layout.findUnique({
      where: { tripId },
    });

    return NextResponse.json(layout?.content || []);
  } catch (error) {
    console.error("Error fetching layout:", error);
    return new NextResponse(
      `Internal Server Error: ${(error as Error).message}`,
      { status: 500 }
    );
  }
}
