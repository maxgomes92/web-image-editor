import type { ImageElement } from "./types";
import { useRef, useEffect } from "react";
import { Image as KonvaImage, Transformer } from "react-konva";
import Konva from "konva";

export interface DraggableImageProps {
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: Partial<ImageElement>) => void;
}

export const DraggableImage = ({
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
