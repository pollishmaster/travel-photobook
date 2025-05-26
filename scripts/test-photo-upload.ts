import { prisma } from "@/lib/prisma";

async function testPhotoUpload() {
  try {
    console.log("\n=== Starting Photo Upload Test ===\n");

    // 1. Create a test trip
    const trip = await prisma.trip.create({
      data: {
        title: "Test Trip " + Date.now(),
        location: "Test Location",
        startDate: new Date(),
        userId: "test_user", // Replace with an actual user ID from your database
        shareLink: `test-${Date.now()}`,
      },
    });

    console.log("Created test trip:", {
      id: trip.id,
      title: trip.title,
    });

    // 2. Add a test photo
    const photo = await prisma.photo.create({
      data: {
        url: "https://res.cloudinary.com/dxox6yufr/image/upload/v1748221294/test-photo.jpg",
        caption: "Test Photo",
        tripId: trip.id,
        takenAt: new Date(),
      },
    });

    console.log("Created test photo:", {
      id: photo.id,
      url: photo.url,
      tripId: photo.tripId,
    });

    // 3. Verify the photo was associated with the trip
    const tripWithPhoto = await prisma.trip.findUnique({
      where: { id: trip.id },
      include: {
        photos: true,
      },
    });

    console.log("\nVerifying trip-photo association:");
    console.log("Trip ID:", tripWithPhoto?.id);
    console.log("Number of photos:", tripWithPhoto?.photos.length);
    console.log("Photo details:", tripWithPhoto?.photos[0]);

    // 4. Test retrieving photos for the trip
    const photos = await prisma.photo.findMany({
      where: { tripId: trip.id },
      orderBy: { createdAt: "desc" },
    });

    console.log("\nRetrieving photos directly:");
    console.log("Number of photos found:", photos.length);
    photos.forEach((p) => {
      console.log("Photo:", {
        id: p.id,
        url: p.url,
        tripId: p.tripId,
        createdAt: p.createdAt,
      });
    });
  } catch (error) {
    console.error("Error in test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testPhotoUpload();
