import React, { useRef } from 'react';
import { ImageInfo } from '../types';
import ImagePreview from './ImagePreview';

interface ImageGridProps {
    images: ImageInfo[];
    selectedImageId: string | null;
    onSelectImage: (id: string) => void;
    onRemoveImage: (id: string) => void;
    onAddMoreImages: (files: File[]) => void;
    onReorderImages: (dragIndex: number, hoverIndex: number) => void;
    onClearAll: () => void;
}

const AddMoreCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <div
        onClick={onClick}
        className="h-32 w-full border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:bg-slate-700/50 hover:border-slate-500 cursor-pointer transition-colors"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span className="mt-2 text-sm font-semibold">添加更多</span>
    </div>
);

const ImageGrid: React.FC<ImageGridProps> = ({ images, selectedImageId, onSelectImage, onRemoveImage, onAddMoreImages, onReorderImages, onClearAll }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onAddMoreImages(Array.from(e.target.files));
        }
    };

    const handleDragSort = () => {
        if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
            onReorderImages(dragItem.current, dragOverItem.current);
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };


    return (
        <aside className="w-48 bg-slate-900/50 p-4 flex-shrink-0 flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-semibold text-slate-400">
                    列表 ({images.length})
                </h4>
                <button
                    onClick={onClearAll}
                    disabled={images.length === 0}
                    className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-700/50 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                    aria-label="清空所有图片"
                    title="清空所有图片"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto -mr-2 pr-2" onDragOver={(e) => e.preventDefault()}>
                {images.map((image, index) => (
                   <div
                        key={image.id}
                        draggable
                        onDragStart={() => (dragItem.current = index)}
                        onDragEnter={() => (dragOverItem.current = index)}
                        onDragEnd={handleDragSort}
                        className="cursor-grab active:cursor-grabbing"
                    >
                        <ImagePreview
                            key={image.id}
                            image={image}
                            index={index}
                            onRemove={onRemoveImage}
                            onSelect={onSelectImage}
                            isSelected={image.id === selectedImageId}
                        />
                    </div>
                ))}
                <AddMoreCard onClick={() => fileInputRef.current?.click()} />
            </div>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
        </aside>
    );
};

export default ImageGrid;