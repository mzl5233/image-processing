import React, { useState, useCallback, useRef } from 'react';
import Modal from './Modal';

interface ImageDropzoneProps {
    onAddImages: (files: File[]) => void;
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onAddImages }) => {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
    const [urls, setUrls] = useState('');
    const [error, setError] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEvent = (e: React.DragEvent<HTMLDivElement>, isOver: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(isOver);
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onAddImages(Array.from(e.dataTransfer.files));
            e.dataTransfer.clearData();
        }
    }, [onAddImages]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onAddImages(Array.from(e.target.files));
        }
    };
    
    const handleUrlImport = async () => {
        if (!urls) return;
        setError('');
        setIsImporting(true);

        const urlList = urls.split('\n').map(u => u.trim()).filter(Boolean);
        if (urlList.length === 0) {
            setIsImporting(false);
            return;
        }

        const proxies = [
            (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
            (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
        ];

        const fetchWithTimeout = (url: string, timeout = 90000): Promise<Response> => {
            return new Promise((resolve, reject) => {
                const controller = new AbortController();
                const { signal } = controller;
                
                const timeoutId = setTimeout(() => {
                    controller.abort();
                    reject(new Error('请求超时'));
                }, timeout);

                fetch(url, { signal })
                    .then(response => {
                        clearTimeout(timeoutId);
                        resolve(response);
                    })
                    .catch(error => {
                        clearTimeout(timeoutId);
                        if (error.name !== 'AbortError') {
                            reject(error);
                        }
                    });
            });
        };
        
        const fetchWithFallback = async (url: string) => {
            let lastError: any = null;
            for (const proxy of proxies) {
                try {
                    const response = await fetchWithTimeout(proxy(url));
                    if (response.ok) {
                        return response;
                    }
                    lastError = new Error(`代理请求失败，状态码: ${response.status}`);
                } catch (err) {
                    lastError = err;
                }
            }
            throw lastError || new Error('所有代理均无法获取该URL。');
        };

        const results = await Promise.allSettled(
            urlList.map(async (url) => {
                const response = await fetchWithFallback(url);
                const blob = await response.blob();
                const fileName = url.substring(url.lastIndexOf('/') + 1).split('?')[0] || 'image.jpg';
                const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
                return file;
            })
        );
        
        setIsImporting(false);
        
        const successfulFiles: File[] = [];
        const failedUrls: string[] = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                successfulFiles.push(result.value);
            } else {
                failedUrls.push(urlList[index]);
                console.error(`导入失败 ${urlList[index]}:`, result.reason);
            }
        });

        if (successfulFiles.length > 0) {
            onAddImages(successfulFiles);
        }

        if (failedUrls.length > 0) {
            const successCount = successfulFiles.length;
            const failedCount = failedUrls.length;
            setError(
                `${successCount > 0 ? `${successCount}个URL导入成功，` : ''}${failedCount}个失败。\n` +
                '这可能是因为服务器防抓取或链接已失效。\n\n' +
                '失败的链接已保留在下方，请检查后重试。'
            );
            setUrls(failedUrls.join('\n'));
        } else {
            setError('');
            setUrls('');
            setIsUrlModalOpen(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto text-center">
            <div
                onDragEnter={(e) => handleDragEvent(e, true)}
                onDragLeave={(e) => handleDragEvent(e, false)}
                onDragOver={(e) => handleDragEvent(e, true)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-10 border-4 border-dashed rounded-2xl cursor-pointer transition-colors ${isDraggingOver ? 'border-blue-500 bg-slate-700/50' : 'border-slate-600 hover:border-slate-500'}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <div className="flex flex-col items-center justify-center space-y-4">
                     <svg className="w-16 h-16 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                    <p className="text-xl font-semibold text-slate-300">拖拽图片到这里</p>
                    <p className="text-slate-400">或点击浏览文件</p>
                </div>
            </div>
            <div className="mt-6">
                <button
                    onClick={() => setIsUrlModalOpen(true)}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-4 rounded-md transition-colors"
                >
                    从URL导入
                </button>
            </div>
            
            {isUrlModalOpen && (
                <Modal title="从URL批量导入图片" onClose={() => setIsUrlModalOpen(false)}>
                    <div className="space-y-4">
                        <textarea
                            rows={8}
                            value={urls}
                            onChange={(e) => setUrls(e.target.value)}
                            placeholder="每行输入一个图片URL...&#10;https://example.com/image1.jpg&#10;https://example.com/image2.png"
                            className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                         {error && <div className="text-red-400 text-sm whitespace-pre-wrap bg-slate-800/50 p-3 rounded-md border border-red-500/30">{error}</div>}
                        <button
                            onClick={handleUrlImport}
                            disabled={isImporting}
                            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-500 disabled:cursor-wait flex items-center justify-center"
                        >
                            {isImporting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>}
                            {isImporting ? '正在导入...' : '导入'}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ImageDropzone;