import React from 'react';

interface ImageResizerProps {
  image: {
    url: string;
    width: number;
    height: number;
  };
  onResize: (width: number, height: number) => void;
}

export default function ImageResizer({ image, onResize }: ImageResizerProps) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="space-y-4">
        <div>
          <label>Width</label>
          <input 
            type="number" 
            value={image.width}
            onChange={(e) => onResize(Number(e.target.value), image.height)}
          />
        </div>
        <div>
          <label>Height</label>
          <input 
            type="number" 
            value={image.height}
            onChange={(e) => onResize(image.width, Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
} 