export interface ImageInfo {
  id: string;
  file: File;
  originalSrc: string;
  processedSrc: string | null;
  hash: string;
}

export type WatermarkPosition = 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface TextWatermark {
  text: string;
  color: string;
  size: number;
  opacity: number;
  position: WatermarkPosition;
}

export interface ImageWatermark {
  src: string | null;
  size: number; // percentage of main image width
  opacity: number;
  position: WatermarkPosition;
}

export interface EditorSettings {
  rotation: number;
  isTextWatermarkEnabled: boolean;
  textWatermark: TextWatermark;
  isImageWatermarkEnabled: boolean;
  imageWatermark: ImageWatermark;
  brightness: number;
  contrast: number;
  saturation: number;
  noise: number;
  outputQuality: number;
  outputFormat: 'jpeg' | 'png' | 'webp';
}