import { EditorSettings, WatermarkPosition } from '../types';

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
    position: WatermarkPosition,
    padding: number
) => {
    let x = 0, y = 0;

    switch (position) {
        case 'top-left':
            x = padding;
            y = padding;
            break;
        case 'top-center':
            x = (mainWidth - wmWidth) / 2;
            y = padding;
            break;
        case 'top-right':
            x = mainWidth - wmWidth - padding;
            y = padding;
            break;
        case 'center':
            x = (mainWidth - wmWidth) / 2;
            y = (mainHeight - wmHeight) / 2;
            break;
        case 'bottom-left':
            x = padding;
            y = mainHeight - wmHeight - padding;
            break;
        case 'bottom-center':
            x = (mainWidth - wmWidth) / 2;
            y = mainHeight - wmHeight - padding;
            break;
        case 'bottom-right':
            x = mainWidth - wmWidth - padding;
            y = mainHeight - wmHeight - padding;
            break;
    }
    return { x, y };
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
    const { x, y } = getWatermarkPosition(mainImage.width, mainImage.height, textMetrics.width, fontSize, settings.textWatermark.position, padding);
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

        const { x, y } = getWatermarkPosition(mainImage.width, mainImage.height, wmWidth, wmHeight, settings.imageWatermark.position, padding);

        ctx.drawImage(watermarkImage, x, y, wmWidth, wmHeight);
        ctx.globalAlpha = 1.0;
    } catch(e) {
        console.error("Could not load watermark image", e);
    }
  }

  switch (settings.outputFormat) {
    case 'png':
      return canvas.toDataURL('image/png');
    case 'webp':
      return canvas.toDataURL('image/webp');
    case 'jpeg':
    default:
      return canvas.toDataURL('image/jpeg', settings.outputQuality / 100);
  }
};