import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { TripPageContent } from "@/components/TripPageContent";
import { TripNote, TripNoteType } from "@/types/TripNote";

interface Photo {
  id: string;
  url: string;
  caption?: string;
  takenAt?: Date;
}

interface Country {
  id: string;
  name: string;
  code: string;
}

export default async function TripPage({
  params,
}: {
  params: { tripId: string };
}) {
  try {
    const { userId } = await auth();
    const { tripId } = params;

    if (!userId) {
      notFound();
    }

    // First fetch the trip to verify ownership
    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
        userId,
      },
    });

    if (!trip) {
      notFound();
    }

    // Then fetch all the related data separately to avoid type issues
    const [photos, notes, countries, layout] = await Promise.all([
      prisma.photo.findMany({
        where: { tripId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          caption: true,
          takenAt: true,
        },
      }),
      prisma.note.findMany({
        where: { tripId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          type: true,
          date: true,
        },
      }),
      prisma.country.findMany({
        where: { tripId },
        select: {
          id: true,
          name: true,
          code: true,
        },
      }),
      prisma.layout.findUnique({
        where: { tripId },
        select: {
          content: true,
        },
      }),
    ]);

    // Transform data to match component props
    const transformedPhotos: Photo[] = photos.map((photo) => ({
      id: photo.id,
      url: photo.url,
      caption: photo.caption || undefined,
      takenAt: photo.takenAt || undefined,
    }));

    const transformedNotes: TripNote[] = notes.map((note) => ({
      id: note.id,
      content: note.content,
      type: note.type as TripNoteType,
      date: note.date.toISOString(),
    }));

    const transformedCountries: Country[] = countries.map((country) => ({
      id: country.id,
      name: country.name,
      code: country.code,
    }));

    return (
      <TripPageContent
        tripId={trip.id}
        title={trip.title}
        photos={transformedPhotos}
        notes={transformedNotes}
        countries={transformedCountries}
        layout={layout?.content}
      />
    );
  } catch (error) {
    console.error("Error fetching trip data:", error);
    notFound();
  }
}
