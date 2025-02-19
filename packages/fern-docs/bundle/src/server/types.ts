import type { FernColorPalette } from "./generateFernColors";

export type RgbaColor = { r: number; g: number; b: number; a?: number };

export interface FileData {
  src: string;
  height?: number;
  width?: number;
  blurDataURL?: string;
  blurWidth?: number;
  blurHeight?: number;
  alt?: string;
}

export interface FernColorTheme extends FernColorPalette {
  logo?: FileData;
  backgroundImage?: FileData;
  /**
   * If true, render a linear gradient in the background using the accent color
   */
  backgroundGradient: boolean;
}
