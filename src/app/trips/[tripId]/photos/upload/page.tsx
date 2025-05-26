import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PhotoUploadForm } from "@/components/PhotoUploadForm";

interface PhotoUploadPageProps {
  params: {
    tripId: string;
  };
}

export const dynamic = "force-dynamic";

export default async function PhotoUploadPage({
  params,
}: PhotoUploadPageProps) {
  const { tripId } = params;

  // Ensure tripId is available
  if (!tripId) {
    console.error("No trip ID provided");
    notFound();
  }

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Verify trip exists and belongs to user
  const trip = await prisma.trip.findUnique({
    where: {
      id: tripId,
    },
  });

  if (!trip || trip.userId !== userId) {
    notFound();
  }

  console.log("Rendering photo upload page for trip:", {
    tripId: trip.id,
    userId: userId,
  });

  return <PhotoUploadForm tripId={trip.id} />;
}
