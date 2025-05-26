import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";

type Trip = Prisma.TripGetPayload<{}>;

export default async function TripsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const trips = await prisma.trip.findMany({
    where: {
      userId,
    },
    orderBy: {
      startDate: "desc",
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Trips</h1>
        <Link
          href="/trips/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No trips yet</h2>
          <p className="text-gray-600 mb-4">
            Start by creating your first trip!
          </p>
          <Link
            href="/trips/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Create Trip
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip: Trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{trip.title}</h2>
                <p className="text-gray-600 mb-4">{trip.location}</p>
                <div className="text-sm text-gray-500">
                  {format(trip.startDate, "MMM d, yyyy")}
                  {trip.endDate && ` - ${format(trip.endDate, "MMM d, yyyy")}`}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
