import { prisma } from "@/lib/prisma";
import { ReadOnlyPhotoBookView } from "@/components/ReadOnlyPhotoBookView";
import { Section } from "@/types/layout";
import { Photo, Note } from "@prisma/client";

interface PageProps {
  params: {
    tripId: string;
  };
}

export default async function SharePage({ params }: PageProps) {
  const trip = await prisma.trip.findFirst({
    where: {
      id: params.tripId,
    },
    include: {
      photos: {
        orderBy: {
          createdAt: "desc",
        },
      },
      countries: true,
      notes: {
        orderBy: {
          createdAt: "desc",
        },
      },
      layout: true,
    },
  });

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">Trip not found</h1>
      </div>
    );
  }

  // If there's a saved layout, use it
  if (trip.layout?.content) {
    const layout = JSON.parse(JSON.stringify(trip.layout.content)) as Section[];

    console.log("[SHARED_VIEW] Rendering trip with layout:", {
      id: trip.id,
      title: trip.title,
      sectionCount: layout.length,
    });

    return (
      <div className="min-h-screen bg-gray-50">
        <ReadOnlyPhotoBookView
          title={trip.title}
          location={trip.location}
          startDate={trip.startDate}
          endDate={trip.endDate}
          countries={trip.countries}
          sections={layout}
        />
      </div>
    );
  }

  // If no layout exists, create a default one
  const photos = trip.photos.map((photo: Photo) => ({
    id: photo.id,
    url: photo.url,
    caption: photo.caption || "",
    takenAt: photo.takenAt || undefined,
  }));

  const notes = trip.notes.map((note: Note) => ({
    id: note.id,
    content: note.content,
    type: note.type,
    date: note.date || undefined,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <ReadOnlyPhotoBookView
        title={trip.title}
        location={trip.location}
        startDate={trip.startDate}
        endDate={trip.endDate}
        countries={trip.countries}
        sections={[
          {
            id: "default",
            title: "Photos",
            content: [
              ...photos.map((photo) => ({
                id: photo.id,
                type: "single" as const,
                photos: [photo],
              })),
              ...notes.map((note) => ({
                id: note.id,
                type: "summary" as const,
                content: note.content,
                date: note.date,
              })),
            ],
          },
        ]}
      />
    </div>
  );
}
