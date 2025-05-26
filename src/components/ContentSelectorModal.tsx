import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { CountryShape } from "./CountryShape";
import { TripNote } from "../types/TripNote";

interface Country {
  id: string;
  name: string;
  code: string;
}

interface Photo {
  id: string;
  url: string;
  caption?: string;
  takenAt?: Date;
}

interface ContentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedItems: (Photo | TripNote)[]) => void;
  type: "photos" | "notes";
  availableContent: (Photo | TripNote)[];
  selectedContent: (Photo | TripNote | Country)[];
}

export function ContentSelectorModal({
  isOpen,
  onClose,
  onSelect,
  type,
  availableContent,
  selectedContent,
}: ContentSelectorModalProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Reset selected items when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedItems(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleItem = (item: Photo | TripNote) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id);
    } else {
      newSelected.add(item.id);
    }
    setSelectedItems(newSelected);
  };

  const handleConfirm = () => {
    const selectedContent = availableContent.filter((item) =>
      selectedItems.has(item.id)
    );
    onSelect(selectedContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            Select {type === "photos" ? "Photos" : "Notes"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {availableContent.map((item) => {
              const isSelected = selectedItems.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleToggleItem(item)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-500"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {"url" in item ? (
                    // Photo content
                    <>
                      <img
                        src={item.url}
                        alt={item.caption || "Photo"}
                        className="w-full h-full object-cover"
                      />
                      {item.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm truncate">
                          {item.caption}
                        </div>
                      )}
                    </>
                  ) : (
                    // Note content
                    <div className="h-full flex items-center justify-center p-4 text-center">
                      <p className="text-gray-600 line-clamp-4">
                        {item.content}
                      </p>
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Selected
          </button>
        </div>
      </div>
    </div>
  );
}
