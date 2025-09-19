import React from 'react';
import { EditorSettings, WatermarkPosition } from '../types';

interface ControlsPanelProps {
    settings: EditorSettings;
    onSettingsChange: (settings: EditorSettings) => void;
    onProcess: () => void;
    onDownload: () => void;
    onClear: () => void;
    isProcessing: boolean;
    imageCount: number;
}

const ControlSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="py-4 border-b border-slate-600">
        <h3 className="text-lg font-semibold text-slate-200 mb-3">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const LabeledInput: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
        {children}
    </div>
);

const ControlsPanel: React.FC<ControlsPanelProps> = ({
    settings, onSettingsChange, onProcess, onDownload, onClear, isProcessing, imageCount
}) => {

    const handleSettingChange = <T extends keyof EditorSettings,>(key: T, value: EditorSettings[T]) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const handleWatermarkChange = (type: 'text' | 'image', key: any, value: any) => {
        const watermarkKey = type === 'text' ? 'textWatermark' : 'imageWatermark';
        onSettingsChange({
            ...settings,
            [watermarkKey]: {
                ...settings[watermarkKey],
                [key]: value
            }
        });
    };
    
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                handleWatermarkChange('image', 'src', event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const watermarkPositions: { value: WatermarkPosition; label: string }[] = [
        { value: 'top-left', label: '左上' },
        { value: 'top-center', label: '中上' },
        { value: 'top-right', label: '右上' },
        { value: 'center', label: '居中' },
        { value: 'bottom-left', label: '左下' },
        { value: 'bottom-center', label: '中下' },
        { value: 'bottom-right', label: '右下' }
    ];

    return (
        <aside className="w-full md:w-96 bg-slate-800 text-slate-300 p-6 flex-shrink-0 flex flex-col h-screen overflow-y-auto">
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-6">图片处理器</h2>

                <ControlSection title="微调旋转">
                    <LabeledInput label={`角度: ${settings.rotation.toFixed(1)}°`}>
                        <div className="flex items-center space-x-4">
                            <input
                                type="range"
                                min="-5"
                                max="5"
                                step="0.1"
                                value={settings.rotation}
                                onChange={(e) => handleSettingChange('rotation', parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="relative w-24">
                                <input
                                    type="number"
                                    min="-5"
                                    max="5"
                                    step="0.1"
                                    value={settings.rotation}
                                    onChange={(e) => handleSettingChange('rotation', Math.max(-5, Math.min(5, parseFloat(e.target.value) || 0)))}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md pl-2 pr-6 py-1 text-sm text-center"
                                />
                                <span className="absolute inset-y-0 right-2 flex items-center text-slate-400 text-sm">°</span>
                            </div>
                        </div>
                    </LabeledInput>
                    <p className="text-xs text-slate-500 mt-1">
                        用于轻微的水平校正，范围-5°到+5°。
                    </p>
                </ControlSection>

                <ControlSection title="画质调节">
                    <LabeledInput label="亮度">
                        <div className="flex items-center space-x-4">
                            <input
                                type="range"
                                min="0"
                                max="200"
                                value={settings.brightness}
                                onChange={(e) => handleSettingChange('brightness', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <input
                                type="number"
                                min="-100"
                                max="100"
                                value={settings.brightness - 100}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    handleSettingChange('brightness', Math.max(0, Math.min(200, val + 100)))
                                }}
                                className="w-24 bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-sm text-center"
                            />
                        </div>
                    </LabeledInput>
                     <LabeledInput label="对比度">
                        <div className="flex items-center space-x-4">
                            <input
                                type="range"
                                min="0"
                                max="200"
                                value={settings.contrast}
                                onChange={(e) => handleSettingChange('contrast', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <input
                                type="number"
                                min="-100"
                                max="100"
                                value={settings.contrast - 100}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    handleSettingChange('contrast', Math.max(0, Math.min(200, val + 100)))
                                }}
                                className="w-24 bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-sm text-center"
                            />
                        </div>
                    </LabeledInput>
                     <LabeledInput label="饱和度">
                        <div className="flex items-center space-x-4">
                            <input
                                type="range"
                                min="0"
                                max="200"
                                value={settings.saturation}
                                onChange={(e) => handleSettingChange('saturation', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <input
                                type="number"
                                min="-100"
                                max="100"
                                value={settings.saturation - 100}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    handleSettingChange('saturation', Math.max(0, Math.min(200, val + 100)))
                                }}
                                className="w-24 bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-sm text-center"
                            />
                        </div>
                    </LabeledInput>
                    <LabeledInput label="噪点">
                        <div className="flex items-center space-x-4">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={settings.noise}
                                onChange={(e) => handleSettingChange('noise', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                             <div className="relative w-24">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={settings.noise}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        handleSettingChange('noise', Math.max(0, Math.min(100, val)))
                                    }}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md pl-2 pr-6 py-1 text-sm text-center"
                                />
                                <span className="absolute inset-y-0 right-2 flex items-center text-slate-400 text-sm">%</span>
                            </div>
                        </div>
                    </LabeledInput>
                </ControlSection>

                <ControlSection title="输出设置">
                    <LabeledInput label="输出格式">
                        <div className="flex space-x-2 rounded-md bg-slate-700 p-1">
                            {(['jpeg', 'png', 'webp'] as const).map(format => (
                                <button
                                    key={format}
                                    onClick={() => handleSettingChange('outputFormat', format)}
                                    className={`w-full rounded px-3 py-1 text-sm font-medium transition-colors ${
                                        settings.outputFormat === format
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-transparent text-slate-300 hover:bg-slate-600'
                                    }`}
                                >
                                    {format.toUpperCase()}
                                </button>
                            ))}
                        </div>
                         <p className="text-xs text-slate-500 mt-1">
                            {
                                {
                                    jpeg: 'JPEG: 有损压缩，文件小，适合照片。',
                                    png: 'PNG: 无损压缩，画质高，文件较大。',
                                    webp: 'WebP: 现代格式，无损压缩，文件通常比PNG小。'
                                }[settings.outputFormat]
                            }
                        </p>
                    </LabeledInput>
                    
                    {settings.outputFormat === 'jpeg' && (
                        <LabeledInput label={`输出质量: ${settings.outputQuality}%`}>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={settings.outputQuality}
                                    onChange={(e) => handleSettingChange('outputQuality', parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="relative w-24">
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={settings.outputQuality}
                                        onChange={(e) => handleSettingChange('outputQuality', Math.max(1, Math.min(100, parseInt(e.target.value) || 0)))}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-md pl-2 pr-6 py-1 text-sm text-center"
                                    />
                                    <span className="absolute inset-y-0 right-2 flex items-center text-slate-400 text-sm">%</span>
                                </div>
                            </div>
                        </LabeledInput>
                    )}
                </ControlSection>

                <ControlSection title="文字水印">
                    <div className="flex items-center">
                         <input type="checkbox" id="text-watermark-toggle" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={settings.isTextWatermarkEnabled} onChange={(e) => handleSettingChange('isTextWatermarkEnabled', e.target.checked)} />
                         <label htmlFor="text-watermark-toggle" className="ml-2 block text-sm text-slate-300">启用文字水印</label>
                    </div>
                   {settings.isTextWatermarkEnabled && <>
                    <LabeledInput label="文本内容">
                        <input type="text" value={settings.textWatermark.text} onChange={e => handleWatermarkChange('text', 'text', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </LabeledInput>
                    <div className="grid grid-cols-2 gap-4">
                        <LabeledInput label="颜色">
                            <input type="color" value={settings.textWatermark.color} onChange={e => handleWatermarkChange('text', 'color', e.target.value)} className="w-full h-10 p-1 bg-slate-700 border border-slate-600 rounded-md cursor-pointer" />
                        </LabeledInput>
                        <LabeledInput label={`大小: ${settings.textWatermark.size}`}>
                            <input type="range" min="10" max="100" value={settings.textWatermark.size} onChange={e => handleWatermarkChange('text', 'size', parseInt(e.target.value))} className="w-full mt-3 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                        </LabeledInput>
                    </div>
                    <LabeledInput label={`不透明度: ${settings.textWatermark.opacity.toFixed(2)}`}>
                        <input type="range" min="0" max="1" step="0.05" value={settings.textWatermark.opacity} onChange={e => handleWatermarkChange('text', 'opacity', parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                    </LabeledInput>
                     <LabeledInput label="位置">
                        <select value={settings.textWatermark.position} onChange={e => handleWatermarkChange('text', 'position', e.target.value as WatermarkPosition)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                           {watermarkPositions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                    </LabeledInput>
                   </>}
                </ControlSection>
                
                <ControlSection title="图片水印">
                    <div className="flex items-center">
                         <input type="checkbox" id="logo-watermark-toggle" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={settings.isImageWatermarkEnabled} onChange={(e) => handleSettingChange('isImageWatermarkEnabled', e.target.checked)} />
                         <label htmlFor="logo-watermark-toggle" className="ml-2 block text-sm text-slate-300">启用图片水印</label>
                    </div>
                   {settings.isImageWatermarkEnabled && <>
                        <LabeledInput label="上传Logo文件">
                           <input type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"/>
                        </LabeledInput>

                        <LabeledInput label="或输入Logo URL">
                            <input
                                type="text"
                                placeholder="https://example.com/logo.png"
                                value={(settings.imageWatermark.src && !settings.imageWatermark.src.startsWith('data:')) ? settings.imageWatermark.src : ''}
                                onChange={e => handleWatermarkChange('image', 'src', e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </LabeledInput>

                        {settings.imageWatermark.src && (
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Logo预览</label>
                                <img src={settings.imageWatermark.src} alt="Logo预览" className="mt-1 h-20 w-20 object-contain bg-slate-700/50 p-1 rounded-md border border-slate-600" />
                            </div>
                        )}

                        <LabeledInput label={`大小: ${settings.imageWatermark.size}%`}>
                            <input type="range" min="1" max="50" value={settings.imageWatermark.size} onChange={e => handleWatermarkChange('image', 'size', parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                        </LabeledInput>
                        <LabeledInput label={`不透明度: ${settings.imageWatermark.opacity.toFixed(2)}`}>
                            <input type="range" min="0" max="1" step="0.05" value={settings.imageWatermark.opacity} onChange={e => handleWatermarkChange('image', 'opacity', parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                        </LabeledInput>
                         <LabeledInput label="位置">
                            <select value={settings.imageWatermark.position} onChange={e => handleWatermarkChange('image', 'position', e.target.value as WatermarkPosition)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                               {watermarkPositions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                        </LabeledInput>
                   </>}
                </ControlSection>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-600 space-y-3">
                 <button
                    onClick={onProcess}
                    disabled={isProcessing || imageCount === 0}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
                >
                    处理全部 ({imageCount}) 张图片
                </button>
                 <button
                    onClick={onDownload}
                    disabled={isProcessing || imageCount === 0}
                    className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
                >
                    全部下载为ZIP
                </button>
                <button
                    onClick={onClear}
                    disabled={isProcessing || imageCount === 0}
                    className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-md hover:bg-red-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
                >
                    全部清空
                </button>
            </div>
        </aside>
    );
};

export default ControlsPanel;