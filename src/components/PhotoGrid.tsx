"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import toast from "react-hot-toast";

interface Photo {
  id: string;
  url: string;
  caption?: string | null;
  order?: number;
}

interface PhotoGridProps {
  photos: Photo[];
  tripId: string;
}

export function PhotoGrid({ photos: initialPhotos, tripId }: PhotoGridProps) {
  // Initialize photos with order if not present
  const [photos, setPhotos] = useState(() => {
    return initialPhotos
      .map((photo, index) => ({
        ...photo,
        order: photo.order ?? index + 1,
      }))
      .sort((a, b) => a.order! - b.order!);
  });

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(photos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order of all items
    const updatedPhotos = items.map((photo, index) => ({
      ...photo,
      order: index + 1,
    }));

    setPhotos(updatedPhotos);

    try {
      const response = await fetch(`/api/trips/${tripId}/photos/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos: updatedPhotos.map((p) => ({
            id: p.id,
            order: p.order,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update photo order");
      }

      toast.success("Photo order updated");
    } catch (error) {
      toast.error("Failed to update photo order");
      // Revert to original order on error
      setPhotos(photos);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable
        droppableId="photos"
        direction="horizontal"
        isDropDisabled={false}
        isCombineEnabled={false}
        ignoreContainerClipping={false}
      >
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex flex-wrap gap-4"
          >
            {photos.map((photo, index) => (
              <Draggable key={photo.id} draggableId={photo.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`aspect-square rounded-lg overflow-hidden w-[calc(50%-8px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-16px)] ${
                      snapshot.isDragging
                        ? "shadow-lg ring-2 ring-blue-500"
                        : ""
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || "Trip photo"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
