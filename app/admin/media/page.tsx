'use client';

import { useState, useEffect, useRef } from 'react';
import { getInitialMedia, saveMedia, MediaItem } from '../../../data/store';
import { compressImage } from '../../../utils/imageCompressor';

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newFilename, setNewFilename] = useState('');
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      setMediaList(getInitialMedia());
    } catch (e) {
      setMediaList([]);
    }
  }, []);

  const processAndAddFile = async (fileOrDataUrl: File | string, filenameHint?: string) => {
    setIsUploading(true);
    setError('');
    setMessage('');

    try {
      const dataUrl = await compressImage(fileOrDataUrl, 1000, 1000, 0.78);
      const filename = filenameHint || (typeof fileOrDataUrl !== 'string' ? fileOrDataUrl.name : `image-${Date.now()}.jpg`);
      
      let finalUrl = dataUrl;
      try {
        const uploadRes = await fetch('/api/upload/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: dataUrl,
            filename: filename,
          }),
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          if (data.url) finalUrl = data.url;
        }
      } catch (err) {
        console.warn('Server upload fallback:', err);
      }

      const newItem: MediaItem = {
        id: `med-${Date.now()}`,
        url: finalUrl,
        filename: filename,
        uploadDate: new Date().toISOString().split('T')[0],
        dimensions: '1000x1000',
      };

      const updated = [newItem, ...mediaList.filter((m) => m.url !== finalUrl)].slice(0, 30);
      setMediaList(updated);
      saveMedia(updated);
      setMessage('Image uploaded, optimized, and saved to Media Library!');
      setTimeout(() => setMessage(''), 3500);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setError(err?.message || 'Failed to process image. Please try another image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processAndAddFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (blob) {
            await processAndAddFile(blob, `pasted-media-${Date.now()}.jpg`);
            return;
          }
        }
      }
    }

    const pastedText = e.clipboardData?.getData('text');
    if (pastedText && pastedText.startsWith('data:image/')) {
      e.preventDefault();
      await processAndAddFile(pastedText, `pasted-dataurl-${Date.now()}.jpg`);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await processAndAddFile(files[0]);
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    if (newUrl.startsWith('data:image/') && newUrl.length > 5000) {
      await processAndAddFile(newUrl, newFilename || 'image-pasted.jpg');
      setNewUrl('');
      setNewFilename('');
      return;
    }

    const newItem: MediaItem = {
      id: `med-${Date.now()}`,
      url: newUrl.trim(),
      filename: newFilename || 'external-image.jpg',
      uploadDate: new Date().toISOString().split('T')[0],
      dimensions: '1200x800',
    };

    const updated = [newItem, ...mediaList].slice(0, 25);
    setMediaList(updated);
    saveMedia(updated);
    setNewUrl('');
    setNewFilename('');
    setMessage('Image link added to Media Library successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this image from Media Library?')) {
      const updated = mediaList.filter((m) => m.id !== id);
      setMediaList(updated);
      saveMedia(updated);
      setMessage('Image removed from library.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const filteredMedia = mediaList.filter((m) =>
    m.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl font-sans" onPaste={handlePaste}>
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#683846]">Media Library</h1>
        <p className="text-xs text-[#332D2F]/70 font-sans mt-0.5">
          Upload, paste screenshots, and manage images for articles, pages, and homepage features.
        </p>
      </div>

      {message && (
        <div className="bg-green-50 text-green-800 text-xs font-semibold p-3.5 rounded-xl border border-green-200 shadow-2xs">
          ✨ {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-xl border border-red-200 shadow-2xs">
          ⚠️ {error}
        </div>
      )}

      {/* Upload Box with Drag & Drop + Paste */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        tabIndex={0}
        className={`bg-white p-6 sm:p-8 rounded-3xl border-2 border-dashed transition-all focus:outline-none focus:ring-2 focus:ring-[#B75B70] shadow-soft ${
          dragOver ? 'border-[#B75B70] bg-[#F8EDEF]' : 'border-gray-200'
        }`}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#F8EDEF] text-[#B75B70] flex items-center justify-center text-2xl shadow-xs">
            📤
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#683846]">
              Upload or Paste New Image
            </h3>
            <p className="text-xs text-[#332D2F]/70 max-w-sm mx-auto mt-1">
              Drag & drop photos here, press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono text-gray-800">Ctrl+V</kbd> to paste from clipboard, or browse your files.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn-primary flex items-center gap-2 cursor-pointer"
          >
            <span>📁</span>
            <span>{isUploading ? 'Compressing & Optimizing...' : 'Select File from Device'}</span>
          </button>
        </div>

        {/* Or Add from External URL */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h4 className="text-xs font-bold text-[#332D2F] uppercase mb-3 text-center sm:text-left">
            Or Add Image by Direct URL:
          </h4>
          <form onSubmit={handleAddUrl} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="https://example.com/photo.jpg or paste image data URL"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none font-mono"
            />
            <input
              type="text"
              placeholder="Label (e.g. Dubai Hills Park)"
              value={newFilename}
              onChange={(e) => setNewFilename(e.target.value)}
              className="w-full sm:w-48 px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#683846] hover:bg-[#332D2F] text-white text-xs font-bold transition-colors whitespace-nowrap shadow-2xs">
              Add Link
            </button>
          </form>
        </div>
      </div>

      {/* Media Gallery */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#683846]">
              All Media Items ({mediaList.length})
            </h2>
            <p className="text-xs text-[#332D2F]/60">
              Click any image to copy its URL or select it when editing pages & articles.
            </p>
          </div>
          <input
            type="search"
            placeholder="Search by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none w-full sm:w-60"
          />
        </div>

        {filteredMedia.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-2">
            <span className="text-3xl block">🖼️</span>
            <p className="text-xs">No media items found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex flex-col shadow-2xs hover:shadow-soft transition-all"
              >
                <div className="aspect-square relative overflow-hidden bg-[#F8EDEF]">
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(item.url);
                        setMessage(`Copied image link for "${item.filename}" to clipboard!`);
                        setTimeout(() => setMessage(''), 3000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white text-[#683846] text-xs font-bold shadow-sm hover:bg-[#F8EDEF] transition-colors"
                      title="Copy URL"
                    >
                      Copy URL
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg bg-red-600 text-white text-xs font-bold shadow-sm hover:bg-red-700 transition-colors"
                      title="Delete Image"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-white space-y-1">
                  <p className="text-xs font-bold text-[#683846] truncate" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="text-[10px] text-[#332D2F]/60">
                    {item.uploadDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
