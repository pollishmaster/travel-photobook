"use client";

import { useState } from "react";
import { ViewToggle } from "@/components/ViewToggle";
import { PhotoBookView } from "@/components/PhotoBookView";
import { PhotoGrid } from "@/components/PhotoGrid";
import { TripNote, TripNoteInput } from "@/types/TripNote";
import { CountryList } from "@/components/CountryList";
import { toast } from "react-hot-toast";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { TripNotes } from "@/components/TripNotes";

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

interface TripPageContentProps {
  tripId: string;
  title: string;
  photos: Photo[];
  notes: TripNote[];
  countries: Country[];
  layout?: any;
}

export function TripPageContent({
  tripId,
  title,
  photos,
  notes,
  countries,
  layout,
}: TripPageContentProps) {
  const [view, setView] = useState<"normal" | "photobook">("normal");

  const handleAddNote = async (note: TripNoteInput) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note),
      });

      if (!response.ok) throw new Error("Failed to add note");
      // Refresh the page to show the new note
      window.location.reload();
    } catch (error) {
      toast.error("Failed to add note");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete note");
      // Refresh the page to update the notes list
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <ViewToggle view={view} onViewChange={setView} />
        </div>

        {view === "photobook" ? (
          <PhotoBookView
            tripId={tripId}
            title={title}
            countries={countries}
            notes={notes}
            photos={photos}
            initialLayout={layout}
          />
        ) : (
          <div className="space-y-12">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Photos
                  </h2>
                  <p className="text-sm text-gray-500">
                    {photos.length} {photos.length === 1 ? "photo" : "photos"}
                  </p>
                </div>
                <Link
                  href={`/trips/${tripId}/photos/upload`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <PlusCircle className="w-5 h-5" />
                  Add Photos
                </Link>
              </div>
              <div className="overflow-hidden">
                <PhotoGrid photos={photos} tripId={tripId} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <CountryList
                countries={countries}
                tripId={tripId}
                notes={notes}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <TripNotes
                notes={notes}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
