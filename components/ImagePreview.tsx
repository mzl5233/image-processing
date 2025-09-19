import React from 'react';
import { ImageInfo } from '../types';

interface ImagePreviewProps {
    image: ImageInfo;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onRemove: (id: string) => void;
    index: number;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, isSelected, onSelect, onRemove, index }) => {
    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent onSelect from being called when removing
        onRemove(image.id);
    };

    return (
        <div 
            onClick={() => onSelect(image.id)}
            className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-200 h-32 flex items-center justify-center bg-black/20 ${isSelected ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-blue-500' : 'ring-0'}`}
        >
            <img
                src={image.originalSrc}
                alt={image.file.name}
                className="max-w-full max-h-full object-contain"
            />
             <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-slate-900/80 text-white text-xs font-bold rounded-full flex items-center justify-center ring-1 ring-slate-500 select-none">
                {index + 1}
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300"></div>
            <button
                onClick={handleRemove}
                className="absolute top-1.5 right-1.5 p-1 bg-red-600/70 text-white rounded-full opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-red-500"
                aria-label="移除图片"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
             <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-xs text-white truncate">{image.file.name}</p>
            </div>
        </div>
    );
};

export default ImagePreview;