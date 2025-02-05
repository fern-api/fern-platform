export type RgbaColor = { r: number; g: number; b: number; a?: number };
export type FileData = {
  url: string;
  width?: number;
  height?: number;
  blurDataUrl?: string;
  alt?: string;
};

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
