import * as React from 'react';
import { Camera, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  folder?: string;
}

export function ImageUpload({ value, onChange, folder = 'profile-images' }: ImageUploadProps) {
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await response.json();
      if (res.success && res.data.url) {
        if (onChange) onChange(res.data.url);
      } else {
        alert(res.message || 'Image upload failed');
      }
    } catch (err) {
      console.error('Error uploading image', err);
      alert('Network error occurred during image upload');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) onChange('');
  };

  return (
    <div
      onClick={() => !loading && fileInputRef.current?.click()}
      className="relative h-24 w-24 rounded-full border border-border/60 bg-secondary/20 hover:bg-secondary/40 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden group shrink-0"
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleUpload}
        disabled={loading}
      />

      {value ? (
        // Renders image preview
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={16} className="text-white" />
          </div>
          <button
            onClick={handleRemove}
            className="absolute top-1 right-1 h-5 w-5 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center border border-white/20 hover:text-rose-400 transition-colors"
            title="Remove image"
          >
            <X size={10} />
          </button>
        </>
      ) : (
        // Renders placeholder cameracard icon
        <div className="flex flex-col items-center justify-center text-center space-y-1 p-2 text-gray-500">
          {loading ? <Loader2 size={16} className="animate-spin text-primary" /> : <Camera size={16} />}
          <span className="text-[8px] font-bold uppercase tracking-wider block">Upload</span>
        </div>
      )}
    </div>
  );
}
export default ImageUpload;
