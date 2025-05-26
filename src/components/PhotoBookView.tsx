import { CountryShape } from "./CountryShape";
import { TripNote } from "../types/TripNote";
import {
  Quote,
  FileText,
  Plus,
  Image,
  X,
  ChevronUp,
  ChevronDown,
  Layout,
} from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ContentSelectorModal } from "./ContentSelectorModal";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { format } from "date-fns";

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

type SectionLayout = "single" | "double" | "triple";

interface PhotoLayout {
  id: string;
  type: "single" | "double" | "triple";
  photos: Photo[];
}

interface NoteLayout {
  id: string;
  type: "quote" | "summary";
  content: string;
  date: string;
}

type SectionContent = PhotoLayout | NoteLayout;

function isPhotoLayout(item: any): item is PhotoLayout {
  return (
    item &&
    typeof item === "object" &&
    "type" in item &&
    ["single", "double", "triple"].includes(item.type) &&
    Array.isArray(item.photos)
  );
}

function isNoteLayout(item: any): item is NoteLayout {
  return (
    item &&
    typeof item === "object" &&
    "type" in item &&
    ["quote", "summary"].includes(item.type) &&
    typeof item.content === "string" &&
    typeof item.date === "string"
  );
}

interface Section {
  id: string;
  title: string;
  content: SectionContent[];
}

interface PhotoBookViewProps {
  tripId: string;
  title: string;
  countries: Country[];
  notes: TripNote[];
  photos: Photo[];
  initialLayout?: Section[];
}

export function PhotoBookView({
  tripId,
  title,
  countries,
  notes,
  photos,
  initialLayout,
}: PhotoBookViewProps) {
  const [sections, setSections] = useState<Section[]>(initialLayout || []);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isAddingLayout, setIsAddingLayout] = useState<{
    sectionId: string | null;
    type: SectionLayout | null;
  }>({
    sectionId: null,
    type: null,
  });
  const [selectorModalState, setSelectorModalState] = useState<{
    isOpen: boolean;
    sectionId: string | null;
    layoutId: string | null;
    type: "photos" | "notes";
  }>({
    isOpen: false,
    sectionId: null,
    layoutId: null,
    type: "photos",
  });

  // Save layout when it changes
  useEffect(() => {
    const saveLayout = async () => {
      try {
        console.log("Saving layout:", JSON.stringify(sections, null, 2));

        const response = await fetch(`/api/trips/${tripId}/layout`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sections }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to save layout: ${errorText}`);
        }

        const savedLayout = await response.json();
        console.log("Layout saved successfully:", savedLayout);
      } catch (error) {
        console.error("Error saving layout:", error);
        toast.error("Failed to save layout");
      }
    };

    if (sections.length > 0) {
      saveLayout();
    }
  }, [sections, tripId]);

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) {
      toast.error("Please enter a section title");
      return;
    }

    const newSection: Section = {
      id: Math.random().toString(36).substr(2, 9),
      title: newSectionTitle.trim(),
      content: [],
    };

    setSections([...sections, newSection]);
    setNewSectionTitle("");
    setIsAddingSection(false);
    toast.success("Section added");
  };

  const handleAddLayout = (sectionId: string, type: SectionLayout) => {
    const newLayout: PhotoLayout = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      photos: [],
    };

    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              content: [...section.content, newLayout],
            }
          : section
      )
    );

    setSelectorModalState({
      isOpen: true,
      sectionId,
      layoutId: newLayout.id,
      type: "photos",
    });
  };

  const handleMoveContent = (
    sectionId: string,
    contentId: string,
    direction: "up" | "down"
  ) => {
    setSections(
      sections.map((section) => {
        if (section.id !== sectionId) return section;

        const contentIndex = section.content.findIndex(
          (item) => item.id === contentId
        );
        if (contentIndex === -1) return section;

        // Don't move if at the edges
        if (
          (direction === "up" && contentIndex === 0) ||
          (direction === "down" && contentIndex === section.content.length - 1)
        ) {
          return section;
        }

        const newContent = [...section.content];
        const newIndex =
          direction === "up" ? contentIndex - 1 : contentIndex + 1;
        [newContent[contentIndex], newContent[newIndex]] = [
          newContent[newIndex],
          newContent[contentIndex],
        ];

        return {
          ...section,
          content: newContent,
        };
      })
    );
  };

  const handleRemoveContent = (sectionId: string, contentId: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              content: section.content.filter((item) => item.id !== contentId),
            }
          : section
      )
    );
    toast.success("Item removed");
  };

  const handleContentSelected = (selectedItems: (Photo | TripNote)[]) => {
    if (!selectorModalState.sectionId) return;

    setSections((prevSections) => {
      const sectionToUpdate = prevSections.find(
        (s) => s.id === selectorModalState.sectionId
      );
      if (!sectionToUpdate) return prevSections;

      return prevSections.map((section) => {
        if (section.id !== selectorModalState.sectionId) return section;

        if (
          selectorModalState.type === "photos" &&
          selectorModalState.layoutId
        ) {
          // Add photos to specific layout
          const updatedContent = section.content.map((item) => {
            if (
              !isPhotoLayout(item) ||
              item.id !== selectorModalState.layoutId
            ) {
              return item;
            }

            const maxPhotos =
              item.type === "single" ? 1 : item.type === "double" ? 2 : 3;

            const selectedPhotos = selectedItems as Photo[];
            const currentPhotos = (item as unknown as { photos: Photo[] })
              .photos;
            const updatedPhotos = [...currentPhotos, ...selectedPhotos].slice(
              0,
              maxPhotos
            );

            const photoLayout: PhotoLayout = {
              id: item.id,
              type: item.type,
              photos: updatedPhotos,
            };

            return photoLayout;
          });

          return {
            ...section,
            content: updatedContent,
          };
        } else if (selectorModalState.type === "notes") {
          // Add notes as new content items
          const newNotes: NoteLayout[] = (selectedItems as TripNote[]).map(
            (note) => ({
              id: Math.random().toString(36).substr(2, 9),
              type: note.type as "quote" | "summary",
              content: note.content,
              date: note.date,
            })
          );

          return {
            ...section,
            content: [...section.content, ...newNotes],
          };
        }

        return section;
      });
    });

    // Close the modal after selection
    setSelectorModalState({
      isOpen: false,
      sectionId: null,
      layoutId: null,
      type: "photos",
    });

    toast.success("Content added to section");
  };

  const handleRemoveSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
    toast.success("Section removed");
  };

  const handleMoveSection = (sectionId: string, direction: "up" | "down") => {
    const index = sections.findIndex((s) => s.id === sectionId);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newSections[index], newSections[newIndex]] = [
      newSections[newIndex],
      newSections[index],
    ];
    setSections(newSections);
  };

  const handleAddContent = (sectionId: string, type: "photos" | "notes") => {
    setSelectorModalState({
      isOpen: true,
      sectionId,
      layoutId: null,
      type,
    });
  };

  const handleRemovePhoto = (
    sectionId: string,
    layoutId: string,
    photoId: string
  ) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              content: section.content.map((item) =>
                isPhotoLayout(item) && item.id === layoutId
                  ? {
                      ...item,
                      photos: item.photos.filter(
                        (photo) => photo.id !== photoId
                      ),
                    }
                  : item
              ),
            }
          : section
      )
    );
    toast.success("Photo removed");
  };

  const getAvailableContent = (type: "photos" | "notes") => {
    if (type === "notes") return notes;

    // Get all used photo IDs from all sections
    const usedPhotoIds = new Set(
      sections
        .flatMap((section) => section.content)
        .filter(isPhotoLayout)
        .flatMap((layout) => layout.photos)
        .map((photo) => photo.id)
    );

    // Return only unused photos
    return photos.filter((photo) => !usedPhotoIds.has(photo.id));
  };

  const getSelectedContent = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return [];

    if (selectorModalState.type === "photos") {
      return section.content.map((item) => item.photos).flat();
    } else {
      return section.content.filter(
        (item): item is TripNote => item.type === "quote"
      );
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) {
      return;
    }

    const sectionId = source.droppableId.split("-")[1];
    const section = sections.find((s) => s.id === sectionId);

    if (!section) return;

    if (type === "layout") {
      // Reorder layouts within a section
      const newContent = Array.from(section.content);
      const [removed] = newContent.splice(source.index, 1);
      newContent.splice(destination.index, 0, removed);

      setSections(
        sections.map((s) =>
          s.id === sectionId ? { ...s, content: newContent } : s
        )
      );
    } else if (type === "photo") {
      // Only allow reordering within the same layout
      if (source.droppableId !== destination.droppableId) {
        return;
      }

      const layoutId = source.droppableId.split("-")[2];
      const layout = section.content.find(
        (item): item is PhotoLayout =>
          isPhotoLayout(item) && item.id === layoutId
      );

      if (!layout) return;

      // Reorder photos within the layout
      const newPhotos = Array.from(layout.photos);
      const [removed] = newPhotos.splice(source.index, 1);
      newPhotos.splice(destination.index, 0, removed);

      // Update the section with new layout photos
      setSections(
        sections.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                content: section.content.map((item) =>
                  isPhotoLayout(item) && item.id === layoutId
                    ? { ...item, photos: newPhotos }
                    : item
                ),
              }
            : s
        )
      );
    }
  };

  const handleMoveLayout = (
    sectionId: string,
    layoutId: string,
    direction: "up" | "down"
  ) => {
    setSections(
      sections.map((section) => {
        if (section.id !== sectionId) return section;

        const layoutIndex = section.content.findIndex(
          (item): item is PhotoLayout =>
            isPhotoLayout(item) && item.id === layoutId
        );
        if (layoutIndex === -1) return section;

        // Don't move if at the edges
        if (
          (direction === "up" && layoutIndex === 0) ||
          (direction === "down" && layoutIndex === section.content.length - 1)
        ) {
          return section;
        }

        const newContent = [...section.content];
        const newIndex = direction === "up" ? layoutIndex - 1 : layoutIndex + 1;
        [newContent[layoutIndex], newContent[newIndex]] = [
          newContent[newIndex],
          newContent[layoutIndex],
        ];

        return {
          ...section,
          content: newContent,
        };
      })
    );
  };

  const handleRemoveLayout = (sectionId: string, layoutId: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              content: section.content.filter(
                (item) => !(isPhotoLayout(item) && item.id === layoutId)
              ),
            }
          : section
      )
    );
    toast.success("Layout removed");
  };

  const handleMoveNote = (
    sectionId: string,
    noteId: string,
    direction: "up" | "down"
  ) => {
    setSections(
      sections.map((section) => {
        if (section.id !== sectionId) return section;

        const noteIndex = section.content.findIndex(
          (item) => !isPhotoLayout(item) && item.id === noteId
        );
        if (noteIndex === -1) return section;

        // Don't move if at the edges
        if (
          (direction === "up" && noteIndex === 0) ||
          (direction === "down" && noteIndex === section.content.length - 1)
        ) {
          return section;
        }

        const newContent = [...section.content];
        const newIndex = direction === "up" ? noteIndex - 1 : noteIndex + 1;
        [newContent[noteIndex], newContent[newIndex]] = [
          newContent[newIndex],
          newContent[noteIndex],
        ];

        return {
          ...section,
          content: newContent,
        };
      })
    );
  };

  const handleRemoveNote = (sectionId: string, noteId: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              content: section.content.filter(
                (item) => !(!isPhotoLayout(item) && item.id === noteId)
              ),
            }
          : section
      )
    );
    toast.success("Note removed");
  };

  const renderSectionContent = (section: Section) => {
    return (
      <div className="space-y-8">
        {section.content.map((item, index) => {
          if (isPhotoLayout(item)) {
            // Photo Layout
            return (
              <div key={item.id}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500 cursor-move">
                      <Layout className="w-4 h-4" />
                      <span className="capitalize">
                        {item.type === "single" && "Full Width"}
                        {item.type === "double" && "Two Photos"}
                        {item.type === "triple" && "Three Photos"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleMoveLayout(section.id, item.id, "up")
                        }
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleMoveLayout(section.id, item.id, "down")
                        }
                        disabled={index === section.content.length - 1}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveLayout(section.id, item.id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    className={`grid gap-4 ${
                      item.type === "single"
                        ? "grid-cols-1"
                        : item.type === "double"
                        ? "grid-cols-2"
                        : "grid-cols-3"
                    }`}
                  >
                    {item.photos
                      .slice(
                        0,
                        item.type === "single"
                          ? 1
                          : item.type === "double"
                          ? 2
                          : 3
                      )
                      .map((photo) => (
                        <div
                          key={photo.id}
                          className={`relative ${
                            item.type !== "single" ? "h-64" : ""
                          }`}
                        >
                          <img
                            src={photo.url}
                            alt="Photo"
                            className={`w-full rounded-lg ${
                              item.type === "single"
                                ? "h-auto object-contain"
                                : "h-full object-cover"
                            }`}
                          />
                          <button
                            onClick={() =>
                              handleRemovePhoto(section.id, item.id, photo.id)
                            }
                            className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            );
          } else {
            // Note
            return (
              <div
                key={item.id}
                className="relative w-full rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow"
              >
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={() => handleMoveNote(section.id, item.id, "up")}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveNote(section.id, item.id, "down")}
                    disabled={index === section.content.length - 1}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveNote(section.id, item.id)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  {item.type === "quote" ? (
                    <Quote className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span>{format(new Date(item.date), "MMM d, yyyy")}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap text-lg">
                  {item.content}
                </p>
              </div>
            );
          }
        })}

        {/* Add Layout Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleAddLayout(section.id, "single")}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500"
          >
            <Layout className="w-5 h-5" />
            Single Photo
          </button>
          <button
            onClick={() => handleAddLayout(section.id, "double")}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500"
          >
            <Layout className="w-5 h-5" />
            Two Photos
          </button>
          <button
            onClick={() => handleAddLayout(section.id, "triple")}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500"
          >
            <Layout className="w-5 h-5" />
            Three Photos
          </button>
        </div>

        {/* Add Notes Button */}
        <button
          onClick={() => handleAddContent(section.id, "notes")}
          className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500"
        >
          <FileText className="w-5 h-5" />
          Add Notes
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Cover Page */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-center">{title}</h1>
      </div>

      {/* Countries Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Countries Visited
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
          {countries.slice(0, 6).map((country) => (
            <div key={country.id} className="aspect-square relative">
              <CountryShape
                code={country.code}
                className="w-full h-full opacity-20"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-medium text-center">
                  {country.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {sections.map((section, index) => (
          <div key={section.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-center flex-grow">
                {section.title}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMoveSection(section.id, "up")}
                  disabled={index === 0}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMoveSection(section.id, "down")}
                  disabled={index === sections.length - 1}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveSection(section.id)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <Droppable
              isDropDisabled={false}
              isCombineEnabled={false}
              ignoreContainerClipping={false}
              droppableId={`section-${section.id}`}
              type="layout"
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-8"
                >
                  {renderSectionContent(section)}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>

      {/* Add Section Button */}
      {!isAddingSection ? (
        <button
          onClick={() => setIsAddingSection(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500"
        >
          Add Section
        </button>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <input
            type="text"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="Enter section title..."
            className="w-full px-4 py-2 border rounded-lg mb-4"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAddingSection(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSection}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Section
            </button>
          </div>
        </div>
      )}

      <ContentSelectorModal
        isOpen={selectorModalState.isOpen}
        onClose={() =>
          setSelectorModalState({
            isOpen: false,
            sectionId: null,
            layoutId: null,
            type: "photos",
          })
        }
        onSelect={handleContentSelected}
        type={selectorModalState.type}
        availableContent={getAvailableContent(selectorModalState.type)}
        selectedContent={[]}
      />
    </div>
  );
}
