"use client";

import { useState } from "react";
import { Globe2, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { CountryCard } from "./CountryCard";
import { TripNote, TripNoteInput } from "../types/TripNote";

interface Country {
  id: string;
  name: string;
  code: string;
}

interface CountryListProps {
  countries: Country[];
  tripId: string;
  notes: TripNote[];
  onAddNote: (note: TripNoteInput) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
}

export function CountryList({
  countries: initialCountries,
  tripId,
  notes,
  onAddNote,
  onDeleteNote,
}: CountryListProps) {
  const [countries, setCountries] = useState(initialCountries);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");

  const handleAddCountry = async () => {
    if (!selectedCountry) return;

    const [code, name] = selectedCountry.split(" - ");

    try {
      const response = await fetch(`/api/trips/${tripId}/countries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name }),
      });

      if (!response.ok) throw new Error("Failed to add country");

      const newCountry = await response.json();
      setCountries([...countries, newCountry]);
      setSelectedCountry("");
      setIsAdding(false);
      toast.success(`Added ${name}`);
    } catch (error) {
      toast.error("Failed to add country");
    }
  };

  const handleRemoveCountry = async (countryId: string) => {
    try {
      const response = await fetch(
        `/api/trips/${tripId}/countries/${countryId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to remove country");

      setCountries(countries.filter((c) => c.id !== countryId));
      toast.success("Country removed");
    } catch (error) {
      toast.error("Failed to remove country");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Countries</h2>
          <p className="text-sm text-gray-500">
            {countries.length}{" "}
            {countries.length === 1 ? "country" : "countries"}
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Country
          </button>
        )}
      </div>

      {isAdding && (
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a country...</option>
              {COUNTRIES.map(([code, name]) => (
                <option key={code} value={`${code} - ${name}`}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddCountry}
              disabled={!selectedCountry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {countries.length === 0 ? (
        <p className="text-gray-500">No countries added yet.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {countries.map((country) => (
            <CountryCard
              key={country.id}
              country={country}
              onRemove={() => handleRemoveCountry(country.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ISO 3166-1 country codes and names
const COUNTRIES: [string, string][] = [
  ["AF", "Afghanistan"],
  ["AL", "Albania"],
  ["DZ", "Algeria"],
  // Add all countries here - I'll show just a few for brevity
  ["US", "United States"],
  ["GB", "United Kingdom"],
  ["KH", "Cambodia"],
  ["FR", "France"],
  ["DE", "Germany"],
  ["IT", "Italy"],
  ["ES", "Spain"],
  ["PT", "Portugal"],
  ["AU", "Australia"],
  ["NZ", "New Zealand"],
  ["JP", "Japan"],
  ["CN", "China"],
  // ... add more countries as needed
];
