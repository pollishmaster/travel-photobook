import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { tripId: string; countryId: string } }
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
      include: {
        countries: {
          where: {
            id: params.countryId,
          },
        },
      },
    });

    if (!trip) {
      return new NextResponse("Trip not found", { status: 404 });
    }

    if (trip.countries.length === 0) {
      return new NextResponse("Country not found", { status: 404 });
    }

    await prisma.country.delete({
      where: {
        id: params.countryId,
      },
    });

    return new NextResponse("Country deleted");
  } catch (error) {
    console.error("Error deleting country:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
