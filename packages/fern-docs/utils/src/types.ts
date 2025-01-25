export interface SourceFile {
  src: string;
}

export interface ImageData extends SourceFile {
  height?: number;
  width?: number;
  blurDataURL?: string;
  blurWidth?: number;
  blurHeight?: number;
}
