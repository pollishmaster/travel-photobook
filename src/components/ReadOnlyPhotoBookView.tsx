"use client";

import { format } from "date-fns";
import { MapPin, Calendar } from "lucide-react";
import { CountryShape } from "./CountryShape";
import { useEffect, useState, useRef, useCallback } from "react";

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

interface Section {
  id: string;
  title: string;
  content: Array<{
    id: string;
    type: string;
    photos?: Photo[];
    content?: string;
  }>;
}

interface ReadOnlyPhotoBookViewProps {
  title: string;
  location?: string;
  startDate?: Date;
  endDate?: Date | null;
  countries: Country[];
  sections: Section[];
}

interface AspectRatioImageProps {
  photo: Photo;
  onLoad: (aspectRatio: number) => void;
  width?: string;
  height?: string;
  objectFit?: "cover" | "contain";
  className?: string;
}

function AspectRatioImage({
  photo,
  onLoad,
  width = "100%",
  height = "100%",
  objectFit = "cover",
  className = "",
}: AspectRatioImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const onLoadRef = useRef(onLoad);

  // Update the ref when onLoad changes
  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth) {
      onLoadRef.current(img.naturalWidth / img.naturalHeight);
    }
  }, []); // Empty dependency array since we're using ref

  return (
    <img
      ref={imgRef}
      src={photo.url}
      alt={photo.caption || "Photo"}
      className={`rounded-lg ${className}`}
      style={{ width, height, objectFit }}
      onLoad={(e) => {
        const img = e.target as HTMLImageElement;
        onLoadRef.current(img.naturalWidth / img.naturalHeight);
      }}
    />
  );
}

interface DoublePhotoLayoutProps {
  photos: Photo[];
}

function DoublePhotoLayout({ photos }: DoublePhotoLayoutProps) {
  const [aspectRatios, setAspectRatios] = useState<number[]>([]);

  const handleImageLoad = useCallback((index: number, aspectRatio: number) => {
    setAspectRatios((prev) => {
      const newRatios = [...prev];
      newRatios[index] = aspectRatio;
      return newRatios;
    });
  }, []);

  // Calculate relative widths based on aspect ratios
  const totalWidth = 100;
  let width1 = totalWidth / 2;
  let width2 = totalWidth / 2;

  if (aspectRatios.length === 2) {
    const ratio1 = aspectRatios[0];
    const ratio2 = aspectRatios[1];
    const totalRatio = ratio1 + ratio2;
    width1 = (ratio1 / totalRatio) * totalWidth;
    width2 = (ratio2 / totalRatio) * totalWidth;
  }

  const handleFirstImageLoad = useCallback(
    (ratio: number) => {
      handleImageLoad(0, ratio);
    },
    [handleImageLoad]
  );

  const handleSecondImageLoad = useCallback(
    (ratio: number) => {
      handleImageLoad(1, ratio);
    },
    [handleImageLoad]
  );

  return (
    <div className="flex gap-4 mb-6 h-[500px]">
      <div style={{ width: `${width1}%` }} className="relative">
        <AspectRatioImage
          photo={photos[0]}
          onLoad={handleFirstImageLoad}
          className="w-full h-full"
        />
      </div>
      <div style={{ width: `${width2}%` }} className="relative">
        <AspectRatioImage
          photo={photos[1]}
          onLoad={handleSecondImageLoad}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

export function ReadOnlyPhotoBookView({
  title,
  location,
  startDate,
  endDate,
  countries,
  sections,
}: ReadOnlyPhotoBookViewProps) {
  const renderPhotoLayout = (photos: Photo[], type: string) => {
    if (type === "single") {
      const photo = photos[0];
      return (
        <div className="mb-6">
          <div className="relative w-full">
            <AspectRatioImage
              photo={photo}
              onLoad={() => {}}
              objectFit="contain"
              className="w-full h-auto"
            />
          </div>
        </div>
      );
    }

    if (type === "double" && photos.length === 2) {
      return <DoublePhotoLayout photos={photos} />;
    }

    // Triple layout remains grid-based
    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        {photos.map((photo) => (
          <div key={photo.id} className="relative h-64">
            <AspectRatioImage
              photo={photo}
              onLoad={() => {}}
              className="w-full h-full"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-serif mb-6">{title}</h1>
          {location && (
            <div className="flex items-center justify-center text-gray-600 mb-2">
              <MapPin className="w-5 h-5 mr-2" />
              <span className="text-lg">{location}</span>
            </div>
          )}
          {startDate && (
            <div className="flex items-center justify-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <span className="text-lg">
                {format(new Date(startDate), "MMMM d, yyyy")}
                {endDate && ` - ${format(new Date(endDate), "MMMM d, yyyy")}`}
              </span>
            </div>
          )}
        </div>

        {/* Countries */}
        {countries.length > 0 && (
          <div className="mb-16">
            <div className="relative mb-12">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-white px-6">
                  <h2 className="text-3xl font-serif italic text-gray-800">
                    Countries Visited
                  </h2>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {countries.map((country) => (
                <div
                  key={country.id}
                  className="relative w-40 h-40 bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow transition-all"
                >
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
              ))}
            </div>
          </div>
        )}

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.id} className="mb-12">
            <div className="relative mb-12">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-white px-6">
                  <h2 className="text-3xl font-serif italic text-gray-800">
                    {section.title}
                  </h2>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-8">
              {section.content.map((item) => {
                if (item.photos) {
                  return (
                    <div key={item.id} className="mb-6">
                      {renderPhotoLayout(item.photos, item.type)}
                    </div>
                  );
                } else if (item.content) {
                  return (
                    <div key={item.id} className="relative p-8 my-8">
                      <div className="relative bg-white px-8 mx-auto max-w-3xl">
                        <span className="absolute -left-4 -top-6 text-6xl text-gray-200 font-serif">
                          "
                        </span>
                        <p className="font-serif text-xl leading-relaxed text-gray-700 italic text-center">
                          {item.content}
                        </p>
                        <span className="absolute -right-4 -bottom-8 text-6xl text-gray-200 font-serif">
                          "
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
