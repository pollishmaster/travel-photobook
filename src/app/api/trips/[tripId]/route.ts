import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Country {
  id: string;
  name: string;
  code: string;
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

    console.log("[TRIP_GET] Fetching trip:", params.tripId);

    const trip = await prisma.trip.findUnique({
      where: {
        id: params.tripId,
      },
      include: {
        photos: {
          orderBy: {
            createdAt: "desc",
          },
        },
        documents: true,
      },
    });

    if (!trip) {
      console.log("[TRIP_GET] Trip not found");
      return new NextResponse("Trip not found", { status: 404 });
    }

    if (trip.userId !== userId) {
      console.log("[TRIP_GET] Unauthorized access:", {
        tripUserId: trip.userId,
        requestUserId: userId,
      });
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch countries in a separate query
    const countries = await prisma.$queryRaw<Country[]>`
      SELECT id, name, code
      FROM "Country"
      WHERE "tripId" = ${params.tripId}
    `;

    const tripWithCountries = {
      ...trip,
      countries,
    };

    console.log("[TRIP_GET] Successfully fetched trip:", {
      id: trip.id,
      title: trip.title,
      countryCount: countries.length,
      photoCount: trip.photos?.length ?? 0,
      documentCount: trip.documents?.length ?? 0,
    });

    return NextResponse.json(tripWithCountries);
  } catch (error) {
    console.error("[TRIP_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
