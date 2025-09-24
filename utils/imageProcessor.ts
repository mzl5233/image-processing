import { EditorSettings, WatermarkPosition, PaddingSettings } from '../types';

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
};

const getWatermarkPosition = (
    mainWidth: number, mainHeight: number,
    wmWidth: number, wmHeight: number,
    position: WatermarkPosition
) => {
    return { x: position.x, y: position.y };
};

const applyPadding = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  settings: PaddingSettings
): {canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D} => {
  if (!settings.enabled) {
    return {canvas, ctx};
  }

  const newCanvas = document.createElement('canvas');
  const newCtx = newCanvas.getContext('2d');
  if (!newCtx) throw new Error('Could not get canvas context for padding');

  newCanvas.width = settings.width;
  newCanvas.height = settings.height;

  // Fill background with padding color
  newCtx.fillStyle = settings.color;
  newCtx.fillRect(0, 0, settings.width, settings.height);

  // Calculate position to center the image
  const scale = Math.min(
    settings.width / canvas.width,
    settings.height / canvas.height
  );

  const scaledWidth = canvas.width * scale;
  const scaledHeight = canvas.height * scale;
  const x = (settings.width - scaledWidth) / 2;
  const y = (settings.height - scaledHeight) / 2;

  // Draw the processed image onto the padded canvas
  newCtx.drawImage(canvas, x, y, scaledWidth, scaledHeight);

  return {canvas: newCanvas, ctx: newCtx};
};

export const processImage = async (
  originalSrc: string,
  settings: EditorSettings,
  watermarkImgSrc: string | null
): Promise<string> => {
  const mainImage = await loadImage(originalSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const angle = (settings.rotation * Math.PI) / 180;

  // Keep original dimensions
  canvas.width = mainImage.width;
  canvas.height = mainImage.height;

  // Apply filters if they are not at default values
  const filters: string[] = [];
  if (settings.brightness !== 100) filters.push(`brightness(${settings.brightness}%)`);
  if (settings.contrast !== 100) filters.push(`contrast(${settings.contrast}%)`);
  if (settings.saturation !== 100) filters.push(`saturate(${settings.saturation}%)`);
  
  if (filters.length > 0) {
      ctx.filter = filters.join(' ');
  }

  // Fill the background with white for formats that don't support transparency
  if (settings.outputFormat === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, mainImage.width, mainImage.height);
  }

  ctx.translate(mainImage.width / 2, mainImage.height / 2);
  ctx.rotate(angle);
  ctx.drawImage(mainImage, -mainImage.width / 2, -mainImage.height / 2);
  ctx.rotate(-angle);
  ctx.translate(-mainImage.width / 2, -mainImage.height / 2);
  
  // Apply noise
  if (settings.noise > 0) {
    const imageData = ctx.getImageData(0, 0, mainImage.width, mainImage.height);
    const data = imageData.data;
    const noiseAmount = settings.noise;
    for (let i = 0; i < data.length; i += 4) {
        const isTransparent = data[i + 3] === 0;
        if (!isTransparent) {
             const random = (Math.random() - 0.5) * noiseAmount;
             data[i] = Math.max(0, Math.min(255, data[i] + random));
             data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + random));
             data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + random));
        }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // Reset filters so they don't apply to watermarks
  ctx.filter = 'none';

  const padding = Math.min(mainImage.width, mainImage.height) * 0.02;

  // Text Watermark
  if (settings.isTextWatermarkEnabled && settings.textWatermark.text) {
    ctx.globalAlpha = settings.textWatermark.opacity;
    ctx.fillStyle = settings.textWatermark.color;
    const fontSize = (settings.textWatermark.size / 1000) * Math.min(mainImage.width, mainImage.height);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const textMetrics = ctx.measureText(settings.textWatermark.text);
    const { x, y } = getWatermarkPosition(mainImage.width, mainImage.height, textMetrics.width, fontSize, settings.textWatermark.position);
    ctx.fillText(settings.textWatermark.text, x, y);
    ctx.globalAlpha = 1.0;
  }

  // Image Watermark
  if (settings.isImageWatermarkEnabled && watermarkImgSrc) {
    try {
        const watermarkImage = await loadImage(watermarkImgSrc);
        ctx.globalAlpha = settings.imageWatermark.opacity;

        const scale = (settings.imageWatermark.size / 100) * (mainImage.width / watermarkImage.width);
        const wmWidth = watermarkImage.width * scale;
        const wmHeight = watermarkImage.height * scale;

        const { x, y } = getWatermarkPosition(mainImage.width, mainImage.height, wmWidth, wmHeight, settings.imageWatermark.position);

        ctx.drawImage(watermarkImage, x, y, wmWidth, wmHeight);
        ctx.globalAlpha = 1.0;
    } catch(e) {
        console.error("Could not load watermark image", e);
    }
  }

  // Apply padding if enabled
  const result = applyPadding(canvas, ctx, mainImage, settings.padding);
  const finalCanvas = result.canvas;

  switch (settings.outputFormat) {
    case 'png':
      return finalCanvas.toDataURL('image/png');
    case 'webp':
      return finalCanvas.toDataURL('image/webp');
    case 'jpeg':
    default:
      return finalCanvas.toDataURL('image/jpeg', settings.outputQuality / 100);
  }
};