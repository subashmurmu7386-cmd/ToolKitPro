import { useState, useRef } from 'react';
import { Upload, Download, Minimize2, ImageIcon } from 'lucide-react';
import { ToolPageWrapper } from '@/components/features/ToolPageWrapper';
import { TOOLS } from '@/constants/tools';
import { formatBytes, downloadFile } from '@/lib/utils';

const tool = TOOLS.find(t => t.id === 'image-compressor')!;

export function ImageCompressor() {
  const [original, setOriginal] = useState<{ file: File; url: string; size: number } | null>(null);
  const [compressed, setCompressed] = useState<{ url: string; size: number; blob: Blob } | null>(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setOriginal({ file, url, size: file.size });
    setCompressed(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const compress = () => {
    if (!original) return;
    setIsProcessing(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      if (format === 'image/jpeg' || format === 'image/webp') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        blob => {
          if (blob) {
            setCompressed({ url: URL.createObjectURL(blob), size: blob.size, blob });
          }
          setIsProcessing(false);
        },
        format,
        format === 'image/png' ? undefined : quality / 100
      );
    };
    img.src = original.url;
  };

  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

  const savings = original && compressed
    ? Math.round((1 - compressed.size / original.size) * 100)
    : 0;

  return (
    <ToolPageWrapper tool={tool}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-10 text-center cursor-pointer transition-all hover:bg-primary/5"
        >
          <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground mb-1">Drop image here or click to browse</p>
          <p className="text-sm text-muted-foreground">Supports JPG, PNG, WebP, GIF, BMP</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>

        {original && (
          <>
            {/* Controls */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
              <h3 className="font-semibold text-foreground">Compression Settings</h3>

              {/* Output Format */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Output Format</label>
                <div className="flex gap-3">
                  {(['image/jpeg', 'image/png', 'image/webp'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        format === f
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {f.split('/')[1].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Slider */}
              {format !== 'image/png' && (
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-foreground">Quality</label>
                    <span className="text-sm font-bold text-primary">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    onChange={e => setQuality(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Smaller file</span>
                    <span>Higher quality</span>
                  </div>
                </div>
              )}

              <button
                onClick={compress}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                <Minimize2 className="w-4 h-4" />
                {isProcessing ? 'Compressing...' : 'Compress Image'}
              </button>
            </div>

            {/* Preview & Stats */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Original */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-foreground">Original</span>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">{formatBytes(original.size)}</span>
                </div>
                <img src={original.url} alt="Original" className="w-full rounded-xl object-contain max-h-48" />
                <p className="text-xs text-muted-foreground mt-2">{original.file.name}</p>
              </div>

              {/* Compressed */}
              <div className={`bg-card border rounded-2xl p-4 ${compressed ? 'border-emerald-500/30' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-foreground">Compressed</span>
                  {compressed && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">{formatBytes(compressed.size)}</span>
                      {savings > 0 && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md font-semibold">-{savings}%</span>
                      )}
                    </div>
                  )}
                </div>
                {compressed ? (
                  <>
                    <img src={compressed.url} alt="Compressed" className="w-full rounded-xl object-contain max-h-48" />
                    <button
                      onClick={() => downloadFile(compressed.blob, `compressed.${extMap[format]}`)}
                      className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Download ({formatBytes(compressed.size)})
                    </button>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-48 rounded-xl bg-secondary/50">
                    <p className="text-sm text-muted-foreground">Compressed preview will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolPageWrapper>
  );
}
