"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { PencilIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readImageFileAsDataUrl } from "@/lib/file-utils";
import { toast } from "sonner";

interface SignatureInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function SignatureInput({ value, onChange }: SignatureInputProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<"draw" | "upload">("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<"draw" | "upload">("draw");

  useEffect(() => {
    if (!value) {
      setMode("draw");
    } else if (sourceRef.current === "upload") {
      setMode("upload");
    }
  }, [value]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (value && value.startsWith("data:image")) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = value;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [value]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0]!.clientX - rect.left) * scaleX,
        y: (e.touches[0]!.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  }, []);

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!isDrawing) return;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    },
    [isDrawing],
  );

  const stopDraw = useCallback(() => {
    setIsDrawing(false);
    const canvas = canvasRef.current!;
    sourceRef.current = "draw";
    onChange(canvas.toDataURL("image/png"));
  }, [onChange]);

  const handleClear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  };

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await readImageFileAsDataUrl(file);
        sourceRef.current = "upload";
        onChange(dataUrl);
        setMode("upload");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to upload image",
        );
      }
      e.target.value = "";
    },
    [onChange],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Button
          type="button"
          variant={mode === "draw" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("draw")}
        >
          <PencilIcon className="h-3.5 w-3.5 mr-1" />
          Draw
        </Button>
        <Button
          type="button"
          variant={mode === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => fileRef.current?.click()}
        >
          <UploadIcon className="h-3.5 w-3.5 mr-1" />
          Upload
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
            <Trash2Icon className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={300}
        height={100}
        className="border border-dashed border-input rounded-md cursor-crosshair bg-background touch-none"
        style={{ maxWidth: "100%" }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
    </div>
  );
}
