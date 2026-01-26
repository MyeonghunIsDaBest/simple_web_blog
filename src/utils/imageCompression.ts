import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
}

/**
 * Compresses an image file to reduce its size
 * @param file - The image file to compress
 * @param options - Compression options (optional)
 * @returns Compressed image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type,
    ...options,
  };

  try {
    // Skip compression for files already smaller than target size
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB <= defaultOptions.maxSizeMB) {
      console.log(`Image ${file.name} is already optimized (${fileSizeMB.toFixed(2)}MB)`);
      return file;
    }

    console.log(`Compressing ${file.name} from ${fileSizeMB.toFixed(2)}MB...`);
    const compressedFile = await imageCompression(file, defaultOptions);
    const compressedSizeMB = compressedFile.size / 1024 / 1024;

    console.log(
      `Compressed ${file.name}: ${fileSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB (${((1 - compressedSizeMB / fileSizeMB) * 100).toFixed(1)}% reduction)`
    );

    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Compresses multiple image files in parallel
 * @param files - Array of image files to compress
 * @param options - Compression options (optional)
 * @returns Array of compressed image files
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  const compressionPromises = files.map((file) => compressImage(file, options));
  return Promise.all(compressionPromises);
}

/**
 * Validates if a file is an image
 * @param file - File to validate
 * @returns true if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Gets a human-readable file size string
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
