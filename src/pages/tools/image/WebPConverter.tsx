import { useState, useRef } from 'react';
import { Upload, Download, ArrowLeftRight } from 'lucide-react';
import { ToolPageWrapper } from '@/components/features/ToolPageWrapper';
import { TOOLS } from '@/constants/tools';
import { formatBytes, downloadFile } from '@/lib/utils';

const tool = TOOLS.find(t => t.id === 'webp-converter')!;

export function WebPConverter() {
  const [files, setFiles] = useState<Array<{
    file: File;
    originalUrl: string;
    convertedBlob: Blob | null;
    convertedUrl: string | null;
    status: 'pending' | 'converting' | 'done' | 'error';
  }>>([]);
  const [outputFormat, setOutputFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (selected: FileList) => {
    const arr = Array.from(selected).map(f => ({
      file: f,
      originalUrl: URL.createObjectURL(f),
      convertedBlob: null,
      convertedUrl: null,
      status: 'pending' as const,
    }));
    setFiles(prev => [...prev, ...arr]);
  };

  const convertFile = (idx: number) => {
    const item = files[idx];
    if (!item) return;
    setFiles(prev => prev.map((f, i) => i === idx ? { ...f, status: 'converting' } : f));

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
          setFiles(prev => prev.map((f, i) =>
            i === idx ? { ...f, status: 'done', convertedBlob: blob, convertedUrl: URL.createObjectURL(blob) } : f
          ));
        } else {
          setFiles(prev => prev.map((f, i) => i === idx ? { ...f, status: 'error' } : f));
        }
      }, outputFormat, 0.95);
    };
    img.onerror = () => {
      setFiles(prev => prev.map((f, i) => i === idx ? { ...f, status: 'error' } : f));
    };
    img.src = item.originalUrl;
  };

  const convertAll = () => {
    files.forEach((f, i) => { if (f.status === 'pending') convertFile(i); });
  };

  const ext = outputFormat === 'image/png' ? 'png' : 'jpg';

  return (
    <ToolPageWrapper tool={tool}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Format selection */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Conversion Settings</h3>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Convert To</label>
            <div className="flex gap-3">
              {(['image/png', 'image/jpeg'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setOutputFormat(f)}
                  className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    outputFormat === f
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {f === 'image/png' ? 'PNG' : 'JPG'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-primary/5"
        >
          <ArrowLeftRight className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground mb-1">Drop WebP images or click to browse</p>
          <p className="text-sm text-muted-foreground">Batch conversion supported</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/webp,image/*"
            multiple
            className="hidden"
            onChange={e => { if (e.target.files) handleFiles(e.target.files); }}
          />
        </div>

        {files.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{files.length} file(s) loaded</span>
            <button
              onClick={convertAll}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Convert All
            </button>
          </div>
        )}

        {/* File List */}
        <div className="space-y-3">
          {files.map((item, idx) => (
            <div key={idx} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
              <img src={item.originalUrl} alt={item.file.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(item.file.size)}</p>
                {item.status === 'done' && item.convertedBlob && (
                  <p className="text-xs text-emerald-400">✓ Converted ({formatBytes(item.convertedBlob.size)})</p>
                )}
                {item.status === 'error' && (
                  <p className="text-xs text-red-400">✗ Conversion failed</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.status === 'pending' && (
                  <button
                    onClick={() => convertFile(idx)}
                    className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-medium hover:bg-primary/20 transition-all"
                  >
                    Convert
                  </button>
                )}
                {item.status === 'converting' && (
                  <span className="text-xs text-muted-foreground animate-pulse">Converting...</span>
                )}
                {item.status === 'done' && item.convertedBlob && item.convertedUrl && (
                  <button
                    onClick={() => downloadFile(item.convertedBlob!, `${item.file.name.replace(/\.[^.]+$/, '')}.${ext}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-500 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolPageWrapper>
  );
}
