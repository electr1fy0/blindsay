"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const BackgroundRippleEffect = ({
  rows = 18,
  cols = 30,
  cellSize = 56,
}: {
  rows?: number;
  cols?: number;
  cellSize?: number;
}) => {
  const [clickedCell, setClickedCell] = useState<{
    row: number;
    col: number;
    id: number;
  } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseClick = (e: any) => {
      // Ignore touch events so the ripple doesn't trigger on mobile taps/scrolls
      if (e.pointerType === "touch") return;
      
      if (!gridRef.current) return;
      
      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) {
        return;
      }
      
      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);
      setClickedCell({ row, col, id: Date.now() });
    };

    window.addEventListener("pointerdown", handleMouseClick);
    return () => {
      window.removeEventListener("pointerdown", handleMouseClick);
    };
  }, [cellSize]);

  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full overflow-hidden pointer-events-none",
        "[--cell-border-color:rgba(255,255,255,0.04)] [--cell-fill-color:rgba(255,255,255,0.015)]",
        "[mask-image:linear-gradient(to_bottom,white_30%,transparent_100%)]"
      )}
    >
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
        <DivGrid
          gridRef={gridRef}
          rows={rows}
          cols={cols}
          cellSize={cellSize}
          borderColor="var(--cell-border-color)"
          fillColor="var(--cell-fill-color)"
          clickedCell={clickedCell}
        />
      </div>
    </div>
  );
};

type DivGridProps = {
  rows: number;
  cols: number;
  cellSize: number;
  borderColor: string;
  fillColor: string;
  clickedCell: { row: number; col: number; id: number } | null;
  gridRef?: React.RefObject<HTMLDivElement | null>;
};

const DivGrid = ({
  rows = 7,
  cols = 30,
  cellSize = 56,
  borderColor = "#3f3f46",
  fillColor = "rgba(14,165,233,0.3)",
  clickedCell = null,
  gridRef,
}: DivGridProps) => {
  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols],
  );

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
  };

  return (
    <div ref={gridRef} className="relative" style={gridStyle}>
      {cells.map((idx) => {
        const rowIdx = Math.floor(idx / cols);
        const colIdx = idx % cols;
        const distance = clickedCell
          ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
          : 0;
        const delay = clickedCell ? Math.max(0, distance * 45) : 0;
        const duration = clickedCell ? 300 + distance * 60 : 0;

        return (
          <div
            key={`${idx}-${clickedCell?.id || 0}`}
            className={cn(
              "cell relative border-[0.5px] opacity-70 transition-opacity duration-150 will-change-transform",
            )}
            style={{
              backgroundColor: fillColor,
              borderColor: borderColor,
              ...(clickedCell
                ? {
                    animation: `cell-ripple ${duration}ms ${delay}ms ease-out 1 normal none`,
                  }
                : {}),
            }}
          />
        );
      })}
    </div>
  );
};
