import { X } from "lucide-react";
import { CountryShape } from "./CountryShape";

interface Country {
  id: string;
  name: string;
  code: string;
}

interface CountryCardProps {
  country: Country;
  onRemove: () => void;
}

export function CountryCard({ country, onRemove }: CountryCardProps) {
  const getBackgroundColor = (code: string) => {
    // Europe
    if (
      [
        "GB",
        "FR",
        "DE",
        "IT",
        "ES",
        "PT",
        "GR",
        "SE",
        "NO",
        "DK",
        "FI",
        "PL",
        "RO",
      ].includes(code)
    ) {
      return "bg-blue-200";
    }
    // North America
    if (["US", "CA", "MX"].includes(code)) {
      return "bg-green-200";
    }
    // Asia
    if (["JP", "CN", "KR", "IN", "TH", "VN", "SG"].includes(code)) {
      return "bg-red-200";
    }
    // Africa
    if (["ZA", "EG", "MA", "KE", "NG", "TZ"].includes(code)) {
      return "bg-yellow-200";
    }
    // South America
    if (["BR", "AR", "CL", "PE", "CO", "VE"].includes(code)) {
      return "bg-purple-200";
    }
    // Oceania
    if (["AU", "NZ", "FJ"].includes(code)) {
      return "bg-teal-200";
    }
    return "bg-gray-200";
  };

  return (
    <div className="relative w-40 h-40 bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow transition-all">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-full text-gray-400 hover:text-red-500"
        aria-label={`Remove ${country.name}`}
      >
        <X className="w-5 h-5" />
      </button>
      <div className="absolute inset-0 p-4">
        <CountryShape
          code={country.code}
          className="w-full h-full opacity-25"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent p-2">
        <span className="block text-center font-serif italic text-gray-800">
          {country.name}
        </span>
      </div>
    </div>
  );
}
