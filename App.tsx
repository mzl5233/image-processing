import React, { useState, useCallback, useEffect } from 'react';
import { ImageInfo, EditorSettings } from './types';
import ControlsPanel from './components/ControlsPanel';
import ImageDropzone from './components/ImageDropzone';
import ImageGrid from './components/ImageGrid';
import MainPreview from './components/MainPreview';
import { processImage } from './utils/imageProcessor';
// @ts-ignore
import JSZip from 'jszip';

const App: React.FC = () => {
    const [images, setImages] = useState<ImageInfo[]>([]);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [hashes, setHashes] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const [editorSettings, setEditorSettings] = useState<EditorSettings>({
        rotation: 0,
        isTextWatermarkEnabled: false,
        textWatermark: {
            text: '© 你的品牌',
            color: '#ffffff',
            size: 48,
            opacity: 0.7,
            position: { x: 400, y: 400 },
        },
        isImageWatermarkEnabled: false,
        imageWatermark: {
            src: null,
            size: 15,
            opacity: 0.7,
            position: { x: 200, y: 200 },
        },
        brightness: 100,
        contrast: 100,
        saturation: 100,
        noise: 0,
        outputQuality: 92,
        outputFormat: 'jpeg',
        padding: {
            enabled: false,
            width: 1200,
            height: 1600,
            color: '#ffffff',
        },
    });

    const selectedImage = images.find(img => img.id === selectedImageId);

    useEffect(() => {
        if (!selectedImage) {
            setPreviewSrc(null);
            return;
        }

        const handler = setTimeout(async () => {
            try {
                const generatedPreviewSrc = await processImage(
                    selectedImage.originalSrc,
                    editorSettings,
                    editorSettings.imageWatermark.src
                );
                setPreviewSrc(generatedPreviewSrc);
            } catch (error) {
                console.error("Error generating preview:", error);
                setPreviewSrc(null);
            }
        }, 200);

        return () => {
            clearTimeout(handler);
        };
    }, [selectedImage, editorSettings]);


    const fileToDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    };
    
    const simpleHash = (s: string) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) {
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
      }
      return h.toString();
    }


    const handleAddImages = useCallback(async (files: File[]) => {
        setIsLoading(true);
        setProcessingMessage('正在去重并加载图片...');
        const newImages: ImageInfo[] = [];
        const newHashes = new Set(hashes);

        for (const file of files) {
            try {
                const dataUrl = await fileToDataURL(file);
                const hash = simpleHash(dataUrl);
                if (!newHashes.has(hash)) {
                    newHashes.add(hash);
                    newImages.push({
                        id: `${file.name}-${Date.now()}`,
                        file: file,
                        originalSrc: dataUrl,
                        processedSrc: null,
                        hash: hash,
                    });
                }
            } catch (error) {
                console.error("Error reading file:", error);
            }
        }
        
        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        setHashes(newHashes);
        if (selectedImageId === null && updatedImages.length > 0) {
            setSelectedImageId(updatedImages[0].id);
        }
        setIsLoading(false);
        setProcessingMessage('');
    }, [hashes, images, selectedImageId]);

    const handleRemoveImage = (idToRemove: string) => {
        const imageToRemove = images.find(img => img.id === idToRemove);
        if (!imageToRemove) return;
        
        const remainingImages = images.filter(img => img.id !== idToRemove);
        
        setImages(remainingImages);
        const newHashes = new Set(hashes);
        newHashes.delete(imageToRemove.hash);
        setHashes(newHashes);

        if (selectedImageId === idToRemove) {
            if (remainingImages.length > 0) {
                const currentIndex = images.findIndex(img => img.id === idToRemove);
                const nextIndex = Math.max(0, currentIndex - 1);
                setSelectedImageId(remainingImages[nextIndex].id);
            } else {
                setSelectedImageId(null);
            }
        }
    };

    const handleClearImages = () => {
        setImages([]);
        setHashes(new Set());
        setSelectedImageId(null);
    };
    
    const handleReorderImages = useCallback((dragIndex: number, hoverIndex: number) => {
        setImages(prevImages => {
            const newImages = [...prevImages];
            const draggedImage = newImages[dragIndex];

            newImages.splice(dragIndex, 1);
            newImages.splice(hoverIndex, 0, draggedImage);

            return newImages;
        });
    }, []);

    const handleProcessImages = async () => {
        setIsLoading(true);
        setPreviewSrc(null); 
        setProcessingMessage('正在处理图片... (0%)');
        
        const processedImages = await Promise.all(images.map(async (image, index) => {
            try {
                const processedSrc = await processImage(image.originalSrc, editorSettings, editorSettings.imageWatermark.src);
                 const progress = Math.round(((index + 1) / images.length) * 100);
                setProcessingMessage(`正在处理图片... (${progress}%)`);
                return { ...image, processedSrc };
            } catch (error) {
                console.error(`Error processing image ${image.file.name}:`, error);
                return { ...image, processedSrc: null }; 
            }
        }));

        setImages(processedImages);
        setIsLoading(false);
        setProcessingMessage('处理完成！');
        setTimeout(() => setProcessingMessage(''), 2000);
    };

    const handleDownloadAll = async () => {
      setIsLoading(true);
      setProcessingMessage('准备下载中...');
      const zip = new JSZip();
      let downloadableCount = 0;
      const padding = String(images.length).length;

      images.forEach((image, index) => {
          const srcToDownload = image.processedSrc || image.originalSrc;
          if (srcToDownload) {
              const base64Data = srcToDownload.split(',')[1];
              const fileIndex = String(index + 1).padStart(padding, '0');
              let newFileName = `${fileIndex}_${image.file.name}`;
              if (image.processedSrc) {
                  const nameWithoutExtension = image.file.name.lastIndexOf('.') > 0 ? image.file.name.substring(0, image.file.name.lastIndexOf('.')) : image.file.name;
                  newFileName = `${fileIndex}_${nameWithoutExtension}.${editorSettings.outputFormat}`;
              }
              zip.file(newFileName, base64Data, { base64: true });
              downloadableCount++;
          }
      });
      
      if (downloadableCount > 0) {
        setProcessingMessage('正在压缩文件...');
        zip.generateAsync({ type: "blob" }).then(function(content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "processed_images.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsLoading(false);
            setProcessingMessage('下载已开始！');
            setTimeout(() => setProcessingMessage(''), 2000);
        });
      } else {
        setIsLoading(false);
        setProcessingMessage('没有可供下载的图片。');
        setTimeout(() => setProcessingMessage(''), 2000);
      }
    };

    return (
        <div className="h-screen flex flex-col md:flex-row bg-slate-800/50">
            <ControlsPanel
                settings={editorSettings}
                onSettingsChange={setEditorSettings}
                onProcess={handleProcessImages}
                onDownload={handleDownloadAll}
                onClear={handleClearImages}
                isProcessing={isLoading}
                imageCount={images.length}
            />
            <div className="flex-1 flex flex-row overflow-hidden">
                <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
                            <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                            <p className="text-white text-xl mt-4">{processingMessage}</p>
                        </div>
                    )}
                    {images.length === 0 ? (
                        <ImageDropzone onAddImages={handleAddImages} />
                    ) : (
                        selectedImage ? (
                            <MainPreview
                                image={selectedImage}
                                previewSrc={previewSrc}
                            />
                        ) : (
                             <div className="text-center text-slate-400">
                                <p>请从右侧选择一张图片进行编辑。</p>
                            </div>
                        )
                    )}
                </main>
                 {images.length > 0 && (
                    <ImageGrid
                        images={images}
                        selectedImageId={selectedImageId}
                        onSelectImage={setSelectedImageId}
                        onRemoveImage={handleRemoveImage}
                        onAddMoreImages={handleAddImages}
                        onReorderImages={handleReorderImages}
                        onClearAll={handleClearImages}
                    />
                )}
            </div>
        </div>
    );
};

export default App;