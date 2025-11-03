import { useState, useRef, useCallback } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva";
import type { ImageElement } from "./types";
import { DraggableImage } from "./draggable-image";
import { useDropzone } from "react-dropzone";

export const Editor = () => {
  const [images, setImages] = useState<ImageElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAndImportImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const newImage: ImageElement = {
          id: `image-${Date.now()}`,
          image: img,
          x: 50,
          y: 50,
          width: img.width,
          height: img.height,
        };
        setImages((prevImages) => [...prevImages, newImage]);
        setSelectedId(newImage.id);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles
        .filter((file) => file.type.startsWith("image/"))
        .forEach(loadAndImportImage);
    },
    [loadAndImportImage]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    loadAndImportImage(file);
  };

  const handleImageChange = (id: string, newAttrs: Partial<ImageElement>) => {
    setImages(
      images.map((img) => (img.id === id ? { ...img, ...newAttrs } : img))
    );
  };

  const handleStageClick = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    // Deselect when clicking on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-900" {...getRootProps()}>
      <input
        {...getInputProps()}
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition shadow-lg"
      >
        Click or drop to import 🤙
      </button>

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleStageClick}
        onTouchStart={handleStageClick}
      >
        <Layer>
          {images.map((img) => (
            <DraggableImage
              key={img.id}
              image={img.image}
              x={img.x}
              y={img.y}
              width={img.width}
              height={img.height}
              isSelected={img.id === selectedId}
              onSelect={() => setSelectedId(img.id)}
              onChange={(newAttrs) => handleImageChange(img.id, newAttrs)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
