"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface ShareButtonProps {
  shareLink: string;
}

export function ShareButton({ shareLink }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      onClick={handleShare}
      disabled={isSharing}
    >
      <Share2 className="w-5 h-5" />
      {isSharing ? "Copying..." : "Share Trip"}
    </button>
  );
}
