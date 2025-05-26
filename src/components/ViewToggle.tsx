import { Book, LayoutGrid } from "lucide-react";

interface ViewToggleProps {
  view: "normal" | "photobook";
  onViewChange: (view: "normal" | "photobook") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 p-1">
      <button
        onClick={() => onViewChange("normal")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
          view === "normal"
            ? "bg-blue-100 text-blue-700"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span>Normal</span>
      </button>
      <button
        onClick={() => onViewChange("photobook")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
          view === "photobook"
            ? "bg-blue-100 text-blue-700"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        <Book className="w-4 h-4" />
        <span>Photo Book</span>
      </button>
    </div>
  );
}
