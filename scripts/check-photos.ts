import { prisma } from "@/lib/prisma";

async function checkPhotos() {
  try {
    console.log("\n=== Checking Database State ===\n");

    // 1. Get all photos
    const allPhotos = await prisma.photo.findMany({
      include: {
        trip: true,
      },
    });

    console.log(`Total photos in database: ${allPhotos.length}`);

    // 2. Check each photo
    for (const photo of allPhotos) {
      console.log("\nPhoto Details:");
      console.log(`  ID: ${photo.id}`);
      console.log(`  URL: ${photo.url}`);
      console.log(`  TripId: ${photo.tripId}`);
      console.log(`  Created: ${photo.createdAt}`);
      console.log(`  Trip exists: ${!!photo.trip}`);
      if (photo.trip) {
        console.log(`  Trip title: ${photo.trip.title}`);
        console.log(`  Trip userId: ${photo.trip.userId}`);
      }
    }

    // 3. Get all trips with their photos
    const trips = await prisma.trip.findMany({
      include: {
        photos: true,
      },
    });

    console.log("\n=== Trip Photo Counts ===\n");
    for (const trip of trips) {
      console.log(`Trip: ${trip.title} (ID: ${trip.id})`);
      console.log(`  User: ${trip.userId}`);
      console.log(`  Photos: ${trip.photos.length}`);
      if (trip.photos.length > 0) {
        trip.photos.forEach((photo, idx) => {
          console.log(`    ${idx + 1}. ${photo.url}`);
        });
      }
    }

    // 4. Check for orphaned photos
    const orphanedPhotos = allPhotos.filter((photo) => !photo.trip);
    if (orphanedPhotos.length > 0) {
      console.log("\n!!! ORPHANED PHOTOS FOUND !!!");
      orphanedPhotos.forEach((photo) => {
        console.log(
          `  Photo ${photo.id} references non-existent trip ${photo.tripId}`
        );
      });
    }
  } catch (error) {
    console.error("Error checking database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPhotos()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
