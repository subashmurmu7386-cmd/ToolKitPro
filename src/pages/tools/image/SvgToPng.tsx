import { useState, useRef } from 'react';
import { Layers, Download } from 'lucide-react';
import { ToolPageWrapper } from '@/components/features/ToolPageWrapper';
import { TOOLS } from '@/constants/tools';
import { downloadFile } from '@/lib/utils';

const tool = TOOLS.find(t => t.id === 'svg-to-png')!;

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#g)"/>
  <text x="50" y="65" font-family="Arial" font-size="40" 
        fill="white" text-anchor="middle" font-weight="bold">T</text>
</svg>`;

export function SvgToPng() {
  const [svgCode, setSvgCode] = useState(DEFAULT_SVG);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [transparent, setTransparent] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSvgFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => setSvgCode(e.target?.result as string);
    reader.readAsText(file);
  };

  const generate = (): Promise<Blob | null> => {
    return new Promise(resolve => {
      setIsGenerating(true);
      const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        if (!transparent) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, width, height);
        }
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        canvas.toBlob(blob => {
          if (blob) {
            const previewUrl = URL.createObjectURL(blob);
            setPreview(previewUrl);
          }
          setIsGenerating(false);
          resolve(blob);
        }, 'image/png');
      };
      img.onerror = () => { setIsGenerating(false); resolve(null); };
      img.src = url;
    });
  };

  const handleDownload = async () => {
    const blob = await generate();
    if (blob) downloadFile(blob, 'image.png');
  };

  const handlePreview = () => { generate(); };

  return (
    <ToolPageWrapper tool={tool}>
      <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-6">
        {/* Left - Editor */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">SVG Code</h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                Load SVG File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleSvgFile(f); }}
              />
            </div>
            <textarea
              value={svgCode}
              onChange={e => setSvgCode(e.target.value)}
              className="code-editor w-full h-64 bg-secondary/50 border border-border rounded-xl p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Export Settings */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-foreground">Export Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Width (px)</label>
                <input
                  type="number"
                  value={width}
                  onChange={e => setWidth(Number(e.target.value))}
                  min={16}
                  max={4096}
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Height (px)</label>
                <input
                  type="number"
                  value={height}
                  onChange={e => setHeight(Number(e.target.value))}
                  min={16}
                  max={4096}
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={transparent}
                  onChange={e => setTransparent(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm text-foreground">Transparent background</span>
              </label>
            </div>

            {!transparent && (
              <div className="flex items-center gap-3">
                <label className="text-sm text-foreground">Background color:</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="w-10 h-8 rounded border border-border cursor-pointer"
                />
                <span className="text-sm text-muted-foreground font-mono">{bgColor}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handlePreview}
                disabled={isGenerating}
                className="flex-1 px-4 py-2.5 border border-primary text-primary rounded-xl text-sm font-semibold hover:bg-primary/10 disabled:opacity-50 transition-all"
              >
                Preview
              </button>
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                <Download className="w-4 h-4" />
                {isGenerating ? 'Generating...' : `Download PNG (${width}×${height})`}
              </button>
            </div>
          </div>
        </div>

        {/* Right - Preview */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Preview</h3>
          <div
            className="w-full aspect-square rounded-xl flex items-center justify-center overflow-hidden"
            style={{ background: transparent ? 'repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 0 0 / 16px 16px' : bgColor }}
          >
            {preview ? (
              <img src={preview} alt="SVG preview" className="max-w-full max-h-full object-contain" />
            ) : (
              <div
                className="max-w-full max-h-full"
                dangerouslySetInnerHTML={{ __html: svgCode }}
                style={{ width: '80%', height: '80%' }}
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Output: {width} × {height} pixels · PNG format
          </p>
        </div>
      </div>
    </ToolPageWrapper>
  );
}
