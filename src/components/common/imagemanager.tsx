import React, { useState, useEffect } from 'react';

interface ImageManagerProps {
  existingImages: string[];
  newImages: File[];
  onExistingImagesChange: (images: string[]) => void;
  onNewImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

const ImageManager: React.FC<ImageManagerProps> = ({
  existingImages,
  newImages,
  onExistingImagesChange,
  onNewImagesChange,
  maxImages = 5,
  maxSizeMB = 5
}) => {
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Create previews for new images
  useEffect(() => {
    const previews: string[] = [];
    newImages.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === newImages.length) {
          setNewPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [newImages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError('');

    const totalImages = existingImages.length + newImages.length + files.length;
    if (totalImages > maxImages) {
      setError(`You can only have up to ${maxImages} images total`);
      return;
    }

    const validFiles: File[] = [];

    for (const file of files) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Each image must be less than ${maxSizeMB}MB`);
        continue;
      }

      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onNewImagesChange([...newImages, ...validFiles]);
    }
  };

  const removeExistingImage = (index: number) => {
    const newExistingImages = existingImages.filter((_, i) => i !== index);
    onExistingImagesChange(newExistingImages);
  };

  const removeNewImage = (index: number) => {
    const newFiles = newImages.filter((_, i) => i !== index);
    const newPrev = newPreviews.filter((_, i) => i !== index);
    onNewImagesChange(newFiles);
    setNewPreviews(newPrev);
  };

  const totalImages = existingImages.length + newImages.length;

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {/* Existing Images */}
        {existingImages.map((url, index) => (
          <div key={`existing-${index}`} className="relative group">
            <img
              src={url}
              alt={`Existing ${index + 1}`}
              className="w-28 h-28 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
            />
            <button
              type="button"
              onClick={() => removeExistingImage(index)}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700 font-bold"
              title="Remove this image"
            >
              ×
            </button>
            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded">
              Existing
            </div>
          </div>
        ))}

        {/* New Images */}
        {newPreviews.map((preview, index) => (
          <div key={`new-${index}`} className="relative group">
            <img
              src={preview}
              alt={`New ${index + 1}`}
              className="w-28 h-28 object-cover rounded-lg border-2 border-blue-300 shadow-sm"
            />
            <button
              type="button"
              onClick={() => removeNewImage(index)}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700 font-bold"
              title="Remove this image"
            >
              ×
            </button>
            <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
              New
            </div>
          </div>
        ))}

        {/* Upload Button */}
        {totalImages < maxImages && (
          <label className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group">
            <div className="text-center">
              <svg
                className="w-10 h-10 text-gray-400 mx-auto mb-1 group-hover:text-blue-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-xs text-gray-500 group-hover:text-blue-600 font-medium">Add Image</span>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-2 bg-red-50 px-3 py-2 rounded-md border border-red-200">
          {error}
        </p>
      )}

      <p className="text-xs text-gray-500">
        📸 You have {totalImages} of {maxImages} images (max {maxSizeMB}MB each).
        {existingImages.length > 0 && ` ${existingImages.length} existing, ${newImages.length} new.`}
      </p>
    </div>
  );
};

export default ImageManager;