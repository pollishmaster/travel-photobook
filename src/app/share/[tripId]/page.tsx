import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReadOnlyPhotoBookView } from "@/components/ReadOnlyPhotoBookView";
import { Prisma } from "@prisma/client";

interface Photo {
  id: string;
  url: string;
  caption?: string;
  takenAt?: Date;
}

interface Section {
  id: string;
  title: string;
  content: Array<{
    id: string;
    type: string;
    photos?: Photo[];
    content?: string;
  }>;
}

interface SharedPageProps {
  params: {
    tripId: string;
  };
}

export default async function SharedPage({ params }: SharedPageProps) {
  // Wait for params to be available as per Next.js recommendation
  const tripId = await params.tripId;

  try {
    // Fetch trip data with photos
    const trip = (await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        photos: {
          orderBy: { createdAt: "desc" },
        },
        countries: true,
        notes: {
          orderBy: { createdAt: "desc" },
        },
        layout: true,
      },
    })) as Prisma.TripGetPayload<{
      include: {
        photos: true;
        countries: true;
        notes: true;
        layout: true;
      };
    }>;

    if (!trip) {
      notFound();
    }

    // If there's a saved layout, use it
    if (trip.layout?.content) {
      const layout = trip.layout.content as Section[];

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

    // If no layout, use default organization
    const sections: Section[] = [
      {
        id: "main",
        title: "Trip Memories",
        content: [
          {
            id: "default",
            type: "triple",
            photos: trip.photos.map((photo) => ({
              id: photo.id,
              url: photo.url,
              caption: photo.caption || undefined,
              takenAt: photo.takenAt || undefined,
            })),
          },
          ...trip.notes.map((note) => ({
            id: note.id,
            type: "note",
            content: note.content,
          })),
        ],
      },
    ];

    console.log("[SHARED_VIEW] Rendering trip with default layout:", {
      id: trip.id,
      title: trip.title,
      photoCount: trip.photos.length,
      noteCount: trip.notes.length,
      countryCount: trip.countries.length,
    });

    return (
      <div className="min-h-screen bg-gray-50">
        <ReadOnlyPhotoBookView
          title={trip.title}
          location={trip.location}
          startDate={trip.startDate}
          endDate={trip.endDate}
          countries={trip.countries}
          sections={sections}
        />
      </div>
    );
  } catch (error) {
    console.error("[SHARED_VIEW] Error:", error);
    notFound();
  }
}
