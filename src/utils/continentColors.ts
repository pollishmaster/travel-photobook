// Mapping of countries to their continents
export const countryToContinent: { [key: string]: string } = {
  // Europe
  GB: "europe",
  FR: "europe",
  DE: "europe",
  IT: "europe",
  ES: "europe",

  // North America
  US: "north-america",
  CA: "north-america",
  MX: "north-america",

  // Asia
  JP: "asia",
  CN: "asia",
  IN: "asia",

  // Africa
  ZA: "africa",
  EG: "africa",
  MA: "africa",

  // South America
  BR: "south-america",
  AR: "south-america",
  PE: "south-america",

  // Oceania
  AU: "oceania",
  NZ: "oceania",
};

// Color scheme for continents
export const continentColors: { [key: string]: string } = {
  europe: "bg-blue-200",
  "north-america": "bg-green-200",
  asia: "bg-red-200",
  africa: "bg-yellow-200",
  "south-america": "bg-purple-200",
  oceania: "bg-teal-200",
  default: "bg-gray-200",
};
