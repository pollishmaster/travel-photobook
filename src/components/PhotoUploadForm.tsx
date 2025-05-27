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
  const [uploadCount, setUploadCount] = useState(0);
  const [totalUploads, setTotalUploads] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const handleUpload = async (result: any) => {
    try {
      const response = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: result.info.secure_url,
          tripId: tripId,
          caption: result.info.original_filename,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save photo");
      }

      const data = await response.json();
      console.log("Photo created:", data);

      // Update upload progress
      setUploadedPhotos((prev) => [...prev, data.id]);
      setUploadCount((prev) => {
        const newCount = prev + 1;
        console.log(`Uploaded ${newCount} of ${totalUploads} photos`);

        // Check if this was the last photo
        if (newCount === totalUploads) {
          console.log("All photos uploaded, redirecting...");
          toast.success(
            `${totalUploads} photo${totalUploads > 1 ? "s" : ""} uploaded!`
          );
          // Add a small delay before redirecting to ensure the toast is shown
          setTimeout(() => {
            window.location.href = `/trips/${tripId}`;
          }, 1000);
        }
        return newCount;
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save photo");
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Upload Photos</h1>
        <CldUploadWidget
          uploadPreset="teaakx98"
          options={{
            cloudName: "dxox6yufr",
            maxFiles: 10,
            sources: ["local", "url", "camera"],
            multiple: true,
          }}
          onQueuesStart={(result: any) => {
            console.log("Upload queue started:", result);
            if (result && result.info && result.info.files) {
              const count = result.info.files.length;
              console.log(`Starting upload of ${count} photos`);
              setTotalUploads(count);
              setUploadCount(0);
              setUploadedPhotos([]);
              setIsUploading(true);
            }
          }}
          onSuccess={(result: any) => {
            if (result && result.event === "success") {
              console.log("Upload success:", result);
              handleUpload(result);
            }
          }}
          onError={(error: any) => {
            console.error("Upload error:", error);
            toast.error("Upload failed");
            setIsUploading(false);
          }}
          onClose={() => {
            console.log("Upload widget closed");
            // Only reset if we haven't completed all uploads
            if (uploadCount < totalUploads) {
              setIsUploading(false);
              setUploadCount(0);
              setTotalUploads(0);
              setUploadedPhotos([]);
            }
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
                {isUploading
                  ? `Uploading ${uploadCount} of ${totalUploads} photos...`
                  : "Click to upload photos"}
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
