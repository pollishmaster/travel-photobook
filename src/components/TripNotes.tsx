"use client";

import { useState } from "react";
import { PlusCircle, Quote, FileText, X } from "lucide-react";
import { TripNote, TripNoteInput } from "../types/TripNote";
import { format } from "date-fns";

interface TripNotesProps {
  notes: TripNote[];
  onAddNote: (note: TripNoteInput) => void;
  onDeleteNote: (noteId: string) => void;
}

export function TripNotes({ notes, onAddNote, onDeleteNote }: TripNotesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState<TripNoteInput>({
    content: "",
    type: "summary",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddNote(newNote);
    setNewNote({ content: "", type: "summary" });
    setIsAdding(false);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Travel Notes</h2>
          <p className="text-sm text-gray-500">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <PlusCircle className="w-5 h-5" />
            Add Note
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Add Note Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-4 rounded-xl border border-gray-200 p-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewNote({ ...newNote, type: "summary" })}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                    newNote.type === "summary"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Summary
                </button>
                <button
                  type="button"
                  onClick={() => setNewNote({ ...newNote, type: "quote" })}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                    newNote.type === "quote"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Quote className="w-4 h-4" />
                  Quote
                </button>
              </div>
              <textarea
                value={newNote.content}
                onChange={(e) =>
                  setNewNote({ ...newNote, content: e.target.value })
                }
                placeholder={
                  newNote.type === "quote"
                    ? "Add a memorable quote..."
                    : "Write about your day..."
                }
                className="w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 min-h-[150px] p-3"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Add Note
              </button>
            </div>
          </form>
        )}

        {/* Notes List */}
        {notes.length === 0 ? (
          <p className="text-gray-500">No notes added yet.</p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="relative w-full rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow"
              >
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  {note.type === "quote" ? (
                    <Quote className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span>{format(new Date(note.date), "MMM d, yyyy")}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap text-lg">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
