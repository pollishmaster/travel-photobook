import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { MapPin, Calendar, Share2 } from "lucide-react";

interface TripCardProps {
  trip: {
    id: string;
    title: string;
    location: string;
    startDate: Date;
    endDate?: Date | null;
    photos: { url: string }[];
    shareLink: string;
  };
}

export function TripCard({ trip }: TripCardProps) {
  const coverPhoto = trip.photos[0]?.url || "/placeholder-trip.jpg";

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="relative h-48">
        <Image
          src={coverPhoto}
          alt={trip.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{trip.title}</h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{trip.location}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>
              {format(trip.startDate, "MMM d, yyyy")}
              {trip.endDate && ` - ${format(trip.endDate, "MMM d, yyyy")}`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/trips/${trip.id}`}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View Details
          </Link>

          <button
            onClick={() =>
              navigator.clipboard.writeText(
                `${window.location.origin}/share/${trip.shareLink}`
              )
            }
            className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100"
            title="Copy share link"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
