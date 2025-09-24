import React from 'react';
import { ImageInfo } from '../types';

interface MainPreviewProps {
    image: ImageInfo;
    previewSrc: string | null;
}

const MainPreview: React.FC<MainPreviewProps> = ({ image, previewSrc }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="relative max-w-full max-h-full">
                <img
                    src={previewSrc || image.processedSrc || image.originalSrc}
                    alt={`预览 ${image.file.name}`}
                    className="block max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                />
                {previewSrc && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-md shadow-lg">
                        预览
                    </div>
                )}
            </div>
            <p className="mt-4 text-slate-300 text-center truncate w-full max-w-lg">{image.file.name}</p>
        </div>
    );
};

export default MainPreview;