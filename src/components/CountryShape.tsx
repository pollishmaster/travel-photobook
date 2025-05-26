"use client";

import Image from "next/image";
import { GB_SVG } from "./country-maps/GB";
import { US_SVG } from "./country-maps/US";

interface CountryShapeProps {
  code: string;
  className?: string;
}

const countryToSvg: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  GB: GB_SVG,
  US: US_SVG,
};

export function CountryShape({ code, className = "" }: CountryShapeProps) {
  const SvgComponent = countryToSvg[code.toUpperCase()];

  if (!SvgComponent) {
    // Option 1: Using Next.js Image
    const svgPath = `/country-maps/${code.toUpperCase()}.svg`;
    return (
      <div className={`${className} bg-gray-50 rounded-lg p-4`}>
        <Image
          src={svgPath}
          alt={`Map of ${code}`}
          width={200}
          height={200}
          className="w-full h-full text-blue-500"
        />
      </div>
    );

    // Option 2: Using direct path (less ideal, loses React benefits)
    /*
    return (
      <div className={`${className} bg-gray-50 rounded-lg p-4`}>
        <img 
          src={`/country-maps/${code.toUpperCase()}.svg`}
          alt={`Map of ${code}`}
          className="w-full h-full text-blue-500"
        />
      </div>
    );
    */
  }

  return (
    <div className={`${className} rounded-lg p-4`}>
      <SvgComponent className="w-full h-full text-blue-500" />
    </div>
  );
}
