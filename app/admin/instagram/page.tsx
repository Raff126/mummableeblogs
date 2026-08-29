'use client';

import { useState, useEffect, useRef } from 'react';
import {
  getInitialInstagramPosts,
  saveInstagramPosts,
  getInitialMedia,
  saveMedia,
  InstagramPost,
  MediaItem,
} from '../../../data/store';
import { compressImage } from '../../../utils/imageCompressor';
import ImageInputWithPaste from '../../../components/admin/ImageInputWithPaste';


export default function AdminInstagramPage() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);

  // Form State
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [displayDate, setDisplayDate] = useState(new Date().toISOString().split('T')[0]);
  const [visible, setVisible] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  // Modals & UI States
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'NEW' | 'EDIT'>('NEW');
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPosts(getInitialInstagramPosts());
    setMediaList(getInitialMedia());
  }, []);

  const isValidInstagramUrl = (input: string) => {
    return (
      input.includes('instagram.com/p/') ||
      input.includes('instagram.com/reel/') ||
      input.includes('instagram.com/')
    );
  };

  // Handle local file upload (JPG, PNG, WEBP)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    try {
      const result = await compressImage(file, 800, 800, 0.82);
      if (isEditing && editingPost) {
        setEditingPost({ ...editingPost, image: result });
      } else {
        setPhotoPreview(result);
      }

      // Automatically store in Media Library for reuse
      const newMedia: MediaItem = {
        id: `med-${Date.now()}`,
        url: result,
        filename: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        dimensions: '800x800',
      };
      const updatedMedia = [newMedia, ...mediaList];
      setMediaList(updatedMedia);
      saveMedia(updatedMedia);

      setMessage('Photo uploaded and added to Media Library!');
      setError('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Image compression failed:', err);
      setError('Failed to process image file. Please try another.');
    }
  };


  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !isValidInstagramUrl(url)) {
      setError('Please enter a valid Instagram post URL (e.g. https://www.instagram.com/p/...).');
      return;
    }

    const newPost: InstagramPost = {
      id: `ig-${Date.now()}`,
      url,
      caption: caption || 'Recent moment from MummaBeeBlog',
      displayDate,
      visible,
      image: photoPreview || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&fit=crop&q=80',
    };

    const updated = [newPost, ...posts];
    setPosts(updated);
    saveInstagramPosts(updated);

    // Reset Form
    setUrl('');
    setCaption('');
    setPhotoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError('');
    setMessage('Instagram post added successfully! Uploaded photo is linked to your Instagram URL.');
    setTimeout(() => setMessage(''), 3500);
  };

  const handleToggleVisibility = (id: string) => {
    const updated = posts.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p));
    setPosts(updated);
    saveInstagramPosts(updated);
    setMessage('Post visibility updated.');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleDelete = (id: string) => {
    const updated = posts.filter((p) => p.id !== id);
    setPosts(updated);
    saveInstagramPosts(updated);
    setDeleteConfirmId(null);
    setMessage('Instagram post removed from website.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    if (!isValidInstagramUrl(editingPost.url)) {
      setError('Please enter a valid Instagram URL.');
      return;
    }

    const updated = posts.map((p) => (p.id === editingPost.id ? editingPost : p));
    setPosts(updated);
    saveInstagramPosts(updated);
    setEditingPost(null);
    setError('');
    setMessage('Instagram post updated successfully.');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#683846]">Instagram Feed</h1>
        <p className="text-xs text-[#332D2F]/70 font-sans mt-0.5">
          Upload a photo from your computer and paste the Instagram post link to share updates on your website.
        </p>
      </div>

      {message && (
        <div className="bg-green-50 text-green-800 text-xs font-semibold p-4 rounded-2xl border border-green-200 shadow-2xs">
          ✨ {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 text-xs font-semibold p-4 rounded-2xl border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* Add Instagram Post Form */}
      <form onSubmit={handleAddPost} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-soft space-y-6 font-sans">
        <h2 className="font-serif text-xl font-bold text-[#683846] border-b border-gray-100 pb-3">
          + Add Instagram Post (Photo Upload + Link)
        </h2>

        {/* Photo Upload Area */}
        <div>
          <ImageInputWithPaste
            label="1. Post Photo (Paste Image, Drag & Drop, or Upload File)"
            value={photoPreview}
            onChange={(newUrl) => setPhotoPreview(newUrl)}
            placeholder="Paste image URL, upload photo file, or press Ctrl+V to paste copied image"
            maxWidth={800}
            maxHeight={800}
            helpText="💡 Tip: You can copy any image to clipboard and press Ctrl+V right here to paste it instantly!"
          />
        </div>

        {/* Instagram Post Link */}
        <div>
          <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider mb-1.5">
            2. Instagram Post URL *
          </label>
          <input
            type="url"
            required
            placeholder="https://www.instagram.com/p/C_abc123/ or https://www.instagram.com/reel/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#B75B70] text-xs font-mono text-[#332D2F]"
          />
          <span className="text-[10px] text-[#332D2F]/60 mt-1 block">
            This is the destination link opened when a website visitor clicks the photo.
          </span>
        </div>

        {/* Caption & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider mb-1.5">
              3. Caption (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Weekend beach mornings with the girls in Dubai ☀️"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#332D2F] uppercase tracking-wider mb-1.5">
              4. Display Date
            </label>
            <input
              type="date"
              value={displayDate}
              onChange={(e) => setDisplayDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-[#332D2F] focus:ring-2 focus:ring-[#B75B70] focus:outline-none"
            />
          </div>
        </div>

        {/* Visibility & Submit */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-[#332D2F] uppercase tracking-wider">Visibility:</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-[#332D2F]">
              <input
                type="radio"
                name="visibility"
                checked={visible === true}
                onChange={() => setVisible(true)}
                className="text-[#B75B70] focus:ring-[#B75B70]"
              />
              <span>Visible on Website</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-[#332D2F]">
              <input
                type="radio"
                name="visibility"
                checked={visible === false}
                onChange={() => setVisible(false)}
                className="text-[#B75B70] focus:ring-[#B75B70]"
              />
              <span>Hidden</span>
            </label>
          </div>

          <button type="submit" className="btn-primary">
            + Add Instagram Post
          </button>
        </div>
      </form>

      {/* Existing Instagram Posts Grid */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#683846]">
              Active Instagram Feed ({posts.filter((p) => p.visible).length} Visible)
            </h2>
            <p className="text-xs text-[#332D2F]/70">Newest Instagram updates appear first on the public website.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#F8EDEF]/40 rounded-2xl overflow-hidden border border-gray-100 p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="h-44 rounded-xl overflow-hidden bg-gray-200 relative border border-gray-100">
                  <img
                    src={post.image || '/images/mama-logo.png'}
                    alt={post.caption}
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={`absolute top-2 right-2 text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-xs ${
                      post.visible ? 'bg-[#F8EDEF] text-[#683846] border border-[#D7BB91]' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {post.visible ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#332D2F] line-clamp-2">{post.caption}</p>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-[#B75B70] hover:underline line-clamp-1 block"
                >
                  🔗 {post.url}
                </a>
                <span className="text-[10px] text-[#332D2F]/60 block">{post.displayDate}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <button
                  onClick={() => handleToggleVisibility(post.id)}
                  className="text-[11px] font-bold text-[#332D2F]/70 hover:text-[#683846]"
                >
                  {post.visible ? '👁️ Hide' : '👁️ Show'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingPost(post)}
                    className="text-[11px] font-bold text-[#B75B70] hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(post.id)}
                    className="text-[11px] font-bold text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Media Library Selection Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 bg-[#332D2F]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-[#683846]">Pick Photo from Media Library</h3>
              <button
                onClick={() => setShowMediaPicker(false)}
                className="text-gray-400 hover:text-[#332D2F] text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 overflow-y-auto p-1">
              {mediaList.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    if (mediaPickerTarget === 'NEW') {
                      setPhotoPreview(m.url);
                    } else if (editingPost) {
                      setEditingPost({ ...editingPost, image: m.url });
                    }
                    setShowMediaPicker(false);
                  }}
                  className="cursor-pointer rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-[#B75B70] aspect-square relative group"
                >
                  <img src={m.url} alt={m.filename} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-[#683846]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    Select
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-[#332D2F]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 font-sans max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-2xl font-bold text-[#683846] border-b border-gray-100 pb-2">
              Edit Instagram Post
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Photo Preview & Upload */}
              <div>
                <ImageInputWithPaste
                  label="Photo"
                  value={editingPost.image || ''}
                  onChange={(newUrl) => setEditingPost({ ...editingPost, image: newUrl })}
                  placeholder="Paste image URL, upload photo, or press Ctrl+V"
                  maxWidth={800}
                  maxHeight={800}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Instagram Post URL</label>
                <input
                  type="url"
                  required
                  value={editingPost.url}
                  onChange={(e) => setEditingPost({ ...editingPost, url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono text-[#332D2F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Caption</label>
                <input
                  type="text"
                  value={editingPost.caption}
                  onChange={(e) => setEditingPost({ ...editingPost, caption: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Display Date</label>
                <input
                  type="date"
                  value={editingPost.displayDate}
                  onChange={(e) => setEditingPost({ ...editingPost, displayDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#332D2F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#332D2F] uppercase mb-1">Visibility</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#332D2F]">
                    <input
                      type="radio"
                      name="edit-visibility"
                      checked={editingPost.visible === true}
                      onChange={() => setEditingPost({ ...editingPost, visible: true })}
                    />
                    <span>Visible</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#332D2F]">
                    <input
                      type="radio"
                      name="edit-visibility"
                      checked={editingPost.visible === false}
                      onChange={() => setEditingPost({ ...editingPost, visible: false })}
                    />
                    <span>Hidden</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#332D2F]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-[#332D2F]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <span className="text-3xl">⚠️</span>
            <h3 className="font-serif text-xl font-bold text-[#683846]">Delete Instagram Post?</h3>
            <p className="text-xs text-[#332D2F]/80 leading-relaxed">
              Delete this Instagram post from the website? (This will NOT delete the actual post on Instagram).
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#332D2F] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
