"use client";

import { useCallback, useState } from "react";

export function useResizeY(set: (y: number) => void): {
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  isResizing: boolean;
} {
  const [isResizing, setIsResizing] = useState(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const handlePointerMove = (e: PointerEvent) => {
        set(e.clientY);
        setIsResizing(true);
      };
      const handlePointerUp = (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        setIsResizing(false);
      };
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [set]
  );

  return { onPointerDown, isResizing };
}

export function useResizeX(set: (x: number) => void): {
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  isResizing: boolean;
} {
  const [isResizing, setIsResizing] = useState(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const handlePointerMove = (e: PointerEvent) => {
        set(e.clientX);
        setIsResizing(true);
      };
      const handlePointerUp = (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        setIsResizing(false);
      };
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [set]
  );

  return { onPointerDown, isResizing };
}
