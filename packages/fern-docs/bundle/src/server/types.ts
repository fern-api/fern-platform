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

export type ColorsThemeConfig = {
  accentPrimary: RgbaColor;
  logo?: FileData;
  backgroundImage?: FileData;
  background?: RgbaColor;
  border?: RgbaColor;
  sidebarBackground?: RgbaColor;
  headerBackground?: RgbaColor;
  cardBackground?: RgbaColor;
};
