import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createNoteSchema = z.object({
  content: z.string().min(1),
  type: z.enum(["quote", "summary"]),
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

    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id: params.tripId },
      select: { userId: true },
    });

    if (!trip) {
      return new NextResponse("Trip not found", { status: 404 });
    }

    if (trip.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = createNoteSchema.parse(body);

    const note = await prisma.note.create({
      data: {
        ...validatedData,
        tripId: params.tripId,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify trip ownership or access
    const trip = await prisma.trip.findUnique({
      where: { id: params.tripId },
      select: { userId: true },
    });

    if (!trip) {
      return new NextResponse("Trip not found", { status: 404 });
    }

    const notes = await prisma.note.findMany({
      where: { tripId: params.tripId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("noteId");

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!noteId) {
      return new NextResponse("Note ID is required", { status: 400 });
    }

    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id: params.tripId },
      select: { userId: true },
    });

    if (!trip) {
      return new NextResponse("Trip not found", { status: 404 });
    }

    if (trip.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.note.delete({
      where: {
        id: noteId,
        tripId: params.tripId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting note:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
