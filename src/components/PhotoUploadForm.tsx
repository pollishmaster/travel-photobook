"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Image } from "lucide-react";
import toast from "react-hot-toast";

interface PhotoUploadFormProps {
  tripId: string;
}

export function PhotoUploadForm({ tripId }: PhotoUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Upload Photos</h1>
        <CldUploadWidget
          uploadPreset="teaakx98"
          options={{
            cloudName: "dxox6yufr",
            maxFiles: 1,
          }}
          onSuccess={(result: any) => {
            console.log("Success!", result);
            setIsUploading(true);

            fetch("/api/photos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                url: result.info.secure_url,
                tripId: tripId,
                caption: result.info.original_filename,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                console.log("Photo created:", data);
                toast.success("Photo uploaded!");
                window.location.href = `/trips/${tripId}`;
              })
              .catch((err) => {
                console.error("Error:", err);
                toast.error("Failed to save photo");
              })
              .finally(() => setIsUploading(false));
          }}
          onError={(error: any) => {
            console.error("Upload error:", error);
            toast.error("Upload failed");
          }}
        >
          {({ open }) => (
            <button
              onClick={() => {
                console.log("Opening upload widget");
                open();
              }}
              disabled={isUploading}
              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <Image className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isUploading ? "Uploading..." : "Click to upload a photo"}
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: JPG, PNG, GIF, WebP
              </p>
            </button>
          )}
        </CldUploadWidget>
      </div>
    </div>
  );
}
