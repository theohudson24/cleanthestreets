'use client';

import { useState, useRef } from 'react';

export default function ImageUploader({ 
  images = [], 
  onImagesChange, 
  maxImages = 5,
  maxSizeMB = 5 
}) {
  const [previews, setPreviews] = useState(images);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setError(null);

    // Check max images
    if (previews.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > maxSizeMB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Some files exceed ${maxSizeMB}MB limit`);
      return;
    }

    // Create previews
    const newPreviews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          file,
          preview: reader.result,
          id: Date.now() + Math.random(),
        });
        
        if (newPreviews.length === files.length) {
          const updatedPreviews = [...previews, ...newPreviews];
          setPreviews(updatedPreviews);
          onImagesChange?.(updatedPreviews.map(p => p.file));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    const updated = previews.filter(p => p.id !== id);
    setPreviews(updated);
    onImagesChange?.(updated.map(p => p.file));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {previews.map((preview) => (
          <div key={preview.id} className="relative group">
            <img
              src={preview.preview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded border border-gray-300"
            />
            <button
              onClick={() => removeImage(preview.id)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
        {previews.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
          >
            <span className="text-2xl">+</span>
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageSelect}
        className="hidden"
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <p className="text-sm text-gray-500">
        {previews.length} / {maxImages} images ({maxSizeMB}MB max each)
      </p>
    </div>
  );
}

