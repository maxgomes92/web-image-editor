import { useState, useRef, useCallback, useEffect } from "react";
import { Stage, Layer, type KonvaNodeEvents } from "react-konva";
import Konva from "konva";
import type { ImageElement } from "./types";
import { DraggableImage } from "./draggable-image";
import { useDropzone } from "react-dropzone";
import type { Stage as StageType } from "konva/lib/Stage";

const SCALE_BY = 1.05; // How much to zoom in and out

export const Editor = () => {
  const [images, setImages] = useState<ImageElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<StageType>(null);

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

  // Reference: https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html
  const handleWheel: KonvaNodeEvents["onWheel"] = (e) => {
    e.evt.preventDefault();

    const stage = stageRef.current!;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition()!;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    let direction = e.evt.deltaY > 0 ? 1 : -1;

    if (e.evt.ctrlKey) {
      direction = -direction;
    }

    const newScale = direction > 0 ? oldScale * SCALE_BY : oldScale / SCALE_BY;

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    stage.position(newPos);
  };

  const handleDeleteImage = useCallback(() => {
    if (selectedId) {
      setImages((prevImages) =>
        prevImages.filter((img) => img.id !== selectedId)
      );
      setSelectedId(null);
    }
  }, [selectedId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        handleDeleteImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleDeleteImage]);

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
        onWheel={handleWheel}
        ref={stageRef}
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
