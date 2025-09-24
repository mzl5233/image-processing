export interface ImageInfo {
  id: string;
  file: File;
  originalSrc: string;
  processedSrc: string | null;
  hash: string;
}

export type WatermarkPosition = {x: number; y: number};

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

export interface PaddingSettings {
  enabled: boolean;
  width: number;
  height: number;
  color: string;
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
  padding: PaddingSettings;
}