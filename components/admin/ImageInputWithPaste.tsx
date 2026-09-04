'use client';

import { useState, useRef, useEffect } from 'react';
import { compressImage } from '../../utils/imageCompressor';
import { getInitialMedia, saveMedia, MediaItem } from '../../data/store';

interface ImageInputWithPasteProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  saveToMediaLibrary?: boolean;
  helpText?: string;
}

export default function ImageInputWithPaste({
  label = 'Image',
  value,
  onChange,
  placeholder = 'Paste image URL or click to paste/upload image directly...',
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.82,
  saveToMediaLibrary = true,
  helpText = '💡 Tip: You can press Ctrl+V anywhere in this box to paste a copied screenshot or photo directly, or upload from your device.',
}: ImageInputWithPasteProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setMediaList(getInitialMedia());
    } catch (e) {
      setMediaList([]);
    }
  }, []);

  const uploadToServer = async (dataUrlOrFile: string | File, filenameHint?: string): Promise<string> => {
    try {
      if (typeof dataUrlOrFile === 'string' && dataUrlOrFile.startsWith('data:image/')) {
        const res = await fetch('/api/upload/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: dataUrlOrFile,
            filename: filenameHint || `image-${Date.now()}.jpg`,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) return data.url;
        }
      } else if (dataUrlOrFile instanceof File) {
        const formData = new FormData();
        formData.append('file', dataUrlOrFile);
        const res = await fetch('/api/upload/', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) return data.url;
        }
      }
    } catch (apiErr) {
      console.warn('Server upload error, falling back to local data URL:', apiErr);
    }
    // Fallback to data URL if API fails
    return typeof dataUrlOrFile === 'string' ? dataUrlOrFile : '';
  };

  const processImageFile = async (fileOrDataUrl: File | string, filenameHint?: string) => {
    setIsUploading(true);
    setError('');
    setFeedback('');

    try {
      // 1. Optimize & resize client-side
      const compressedDataUrl = await compressImage(fileOrDataUrl, maxWidth, maxHeight, quality);

      // 2. Upload to server to get permanent public image URL
      const finalUrl = await uploadToServer(compressedDataUrl, filenameHint);
      const urlToUse = finalUrl || compressedDataUrl;

      // 3. Update parent component state
      onChange(urlToUse);

      // 4. Save to Media Library
      if (saveToMediaLibrary) {
        try {
          const newItem: MediaItem = {
            id: `med-${Date.now()}`,
            url: urlToUse,
            filename: filenameHint || (typeof fileOrDataUrl !== 'string' ? fileOrDataUrl.name : `image-${Date.now()}.jpg`),
            uploadDate: new Date().toISOString().split('T')[0],
            dimensions: `${maxWidth}x${maxHeight}`,
          };
          const current = getInitialMedia();
          const updated = [newItem, ...current.filter((m) => m.url !== urlToUse)].slice(0, 30);
          setMediaList(updated);
          saveMedia(updated);
        } catch (mediaErr) {
          console.warn('Could not update media library list:', mediaErr);
        }
      }

      setFeedback('✨ Image uploaded! Remember to click "Save Changes" below to apply to the live site.');
      setTimeout(() => setFeedback(''), 5000);
    } catch (err: any) {
      console.error('Image processing failed:', err);
      setError(err?.message || 'Failed to process image. Please try another photo.');
    } finally {
      setIsUploading(false);
    }
  };

  // 1. Handle Clipboard Paste (Ctrl+V)
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (blob) {
            await processImageFile(blob, `pasted-${Date.now()}.jpg`);
            return;
          }
        }
      }
    }

    // If text was pasted, check if it's a base64 data URL
    const pastedText = e.clipboardData?.getData('text');
    if (pastedText && pastedText.startsWith('data:image/') && pastedText.length > 500) {
      e.preventDefault();
      await processImageFile(pastedText, `pasted-dataurl-${Date.now()}.jpg`);
    }
  };

  // 2. Handle Drag & Drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await processImageFile(files[0]);
    }
  };

  // 3. Handle File Input Selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImageFile(file, file.name);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2 font-sans">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-[#332D2F] uppercase">
            {label}
          </label>
          <button
            type="button"
            onClick={() => setShowMediaPicker(!showMediaPicker)}
            className="text-[11px] font-bold text-[#B75B70] hover:text-[#683846] uppercase cursor-pointer"
          >
            {showMediaPicker ? '✕ Close Media Library' : '📁 Choose from Media Library'}
          </button>
        </div>
      )}

      {/* Main Interactive Paste / Upload Area */}
      <div
        ref={containerRef}
        onPaste={handlePaste}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        tabIndex={0}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all focus:outline-none focus:ring-2 focus:ring-[#B75B70] ${
          dragOver
            ? 'border-[#B75B70] bg-[#F8EDEF]'
            : 'border-gray-200 hover:border-[#B75B70]/50 bg-white'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Image Thumbnail Preview if available */}
          {value ? (
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-50 shadow-xs group">
              <img
                src={value}
                alt="Image Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => onChange('')}
                title="Remove image"
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 bg-[#F8EDEF]/30 flex-shrink-0">
              <span className="text-2xl">🖼️</span>
              <span className="text-[10px] font-bold text-[#B75B70] mt-1">No Image</span>
            </div>
          )}

          {/* Action Inputs */}
          <div className="flex-1 w-full space-y-2.5">
            <div className="flex gap-2">
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('data:image/') && val.length > 1000) {
                    processImageFile(val);
                  } else {
                    onChange(val);
                  }
                }}
                onPaste={handlePaste}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none font-mono truncate"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl bg-[#F8EDEF] hover:bg-[#B75B70] text-[#683846] hover:text-white text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>📤</span>
                <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#332D2F]/70">
              <span>📋 Paste image with <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono text-gray-800">Ctrl+V</kbd> or drag & drop</span>
              {value && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="text-red-500 hover:underline font-bold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {feedback && (
          <div className="mt-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 flex items-center gap-1.5">
            <span>✨</span>
            <span>{feedback}</span>
          </div>
        )}

        {error && (
          <div className="mt-2 text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
            ⚠️ {error}
          </div>
        )}
      </div>

      {helpText && (
        <p className="text-[11px] text-[#332D2F]/60 italic">{helpText}</p>
      )}

      {/* Media Library Picker Modal Drawer */}
      {showMediaPicker && (
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-soft space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="font-serif font-bold text-sm text-[#683846]">
              Select from Media Library ({mediaList.length} items)
            </h4>
            <button
              type="button"
              onClick={() => setShowMediaPicker(false)}
              className="text-xs font-bold text-gray-400 hover:text-[#332D2F] cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          {mediaList.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">
              No media items uploaded yet. Upload an image above to populate your library.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1">
              {mediaList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.url);
                    setShowMediaPicker(false);
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group cursor-pointer ${
                    value === item.url
                      ? 'border-[#B75B70] ring-2 ring-[#B75B70]/30'
                      : 'border-gray-200 hover:border-[#B75B70]'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {value === item.url && (
                    <div className="absolute inset-0 bg-[#B75B70]/20 flex items-center justify-center">
                      <span className="bg-[#B75B70] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
