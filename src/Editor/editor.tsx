import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
import Konva from "konva";

interface ImageElement {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DraggableImageProps {
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: Partial<ImageElement>) => void;
}

const DraggableImage = ({
  image,
  x,
  y,
  width,
  height,
  isSelected,
  onSelect,
  onChange,
}: DraggableImageProps) => {
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        ref={imageRef}
        image={image}
        x={x}
        y={y}
        width={width}
        height={height}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
            width: e.target.width() * e.target.scaleX(),
            height: e.target.height() * e.target.scaleY(),
          });
        }}
        onTransformEnd={() => {
          const node = imageRef.current;
          if (node) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            // Reset scale to 1 and adjust width/height instead
            node.scaleX(1);
            node.scaleY(1);

            onChange({
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
            });
          }
        }}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize to minimum 5px
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export const Editor = () => {
  const [images, setImages] = useState<ImageElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        setImages([...images, newImage]);
        setSelectedId(newImage.id);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
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
    <div className="relative w-full h-screen bg-gray-900">
      <input
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
        Import image
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
