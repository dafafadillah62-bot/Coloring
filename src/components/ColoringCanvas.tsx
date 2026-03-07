import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import { Undo2, Redo2, Download, Eraser, Palette } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ColoringCanvasProps {
  imageUrl: string;
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export const ColoringCanvas: React.FC<ColoringCanvasProps> = ({ imageUrl, selectedColor, onColorChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isEraser, setIsEraser] = useState(false);
  const [loading, setLoading] = useState(true);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(dataUrl);
    // Limit history to 20 steps
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate scale to fit
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;
      
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      saveToHistory();
      setLoading(false);
    };
  }, [imageUrl]);

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    const getPixelColor = (x: number, y: number) => {
      const index = (y * canvas.width + x) * 4;
      return [pixels[index], pixels[index + 1], pixels[index + 2], pixels[index + 3]];
    };

    const targetColor = getPixelColor(startX, startY);
    const fillRGB = hexToRgb(fillColor);

    // Don't fill if target is black (outline) or same as fill color
    if (isBlack(targetColor) || colorsMatch(targetColor, [fillRGB.r, fillRGB.g, fillRGB.b, 255])) return;

    const stack = [[startX, startY]];
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const index = (y * canvas.width + x) * 4;

      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
      if (!colorsMatch(getPixelColor(x, y), targetColor)) continue;

      pixels[index] = fillRGB.r;
      pixels[index + 1] = fillRGB.g;
      pixels[index + 2] = fillRGB.b;
      pixels[index + 3] = 255;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
    saveToHistory();
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const colorsMatch = (c1: number[], c2: number[]) => {
    const threshold = 30;
    return Math.abs(c1[0] - c2[0]) < threshold &&
           Math.abs(c1[1] - c2[1]) < threshold &&
           Math.abs(c1[2] - c2[2]) < threshold;
  };

  const isBlack = (c: number[]) => {
    return c[0] < 50 && c[1] < 50 && c[2] < 50;
  };

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = Math.floor((clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((clientY - rect.top) * (canvas.height / rect.height));

    floodFill(x, y, isEraser ? '#FFFFFF' : selectedColor);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        const img = new Image();
        img.src = history[newIndex];
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          setHistoryIndex(newIndex);
        };
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        const img = new Image();
        img.src = history[newIndex];
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          setHistoryIndex(newIndex);
        };
      }
    }
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'mewarnai.png';
    link.href = canvas.toDataURL();
    link.click();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-4xl mx-auto">
      <div className="flex gap-2 mb-2 bg-white/80 backdrop-blur p-2 rounded-2xl shadow-sm">
        <button onClick={undo} disabled={historyIndex <= 0} className="p-3 rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-colors">
          <Undo2 size={24} />
        </button>
        <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-3 rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-colors">
          <Redo2 size={24} />
        </button>
        <div className="w-px bg-gray-200 mx-1" />
        <button 
          onClick={() => setIsEraser(false)} 
          className={cn("p-3 rounded-xl transition-colors", !isEraser ? "bg-indigo-100 text-indigo-600" : "hover:bg-gray-100")}
        >
          <Palette size={24} />
        </button>
        <button 
          onClick={() => setIsEraser(true)} 
          className={cn("p-3 rounded-xl transition-colors", isEraser ? "bg-indigo-100 text-indigo-600" : "hover:bg-gray-100")}
        >
          <Eraser size={24} />
        </button>
        <div className="w-px bg-gray-200 mx-1" />
        <button onClick={download} className="p-3 rounded-xl hover:bg-gray-100 text-green-600 transition-colors">
          <Download size={24} />
        </button>
      </div>

      <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-white w-full aspect-square max-w-[600px]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-indigo-600 font-medium animate-pulse">Menyiapkan gambar...</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={800}
          height={800}
          className="w-full h-full cursor-crosshair touch-none"
          onMouseDown={handleCanvasClick}
          onTouchStart={handleCanvasClick}
        />
      </div>
    </div>
  );
};
