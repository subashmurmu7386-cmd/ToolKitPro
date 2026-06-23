interface AdBannerProps {
  slot: string;
  className?: string;
  label?: string;
}

// Placeholder for Google AdSense integration
// Replace the inner div with actual AdSense code when ready
export function AdBanner({ slot, className = '', label }: AdBannerProps) {
  return (
    <div
      className={`rounded-xl border border-dashed border-border/40 bg-secondary/20 flex items-center justify-center min-h-[60px] ${className}`}
      data-ad-slot={slot}
      aria-hidden="true"
    >
      {/* 
        To activate AdSense, replace this div content with:
        <ins className="adsbygoogle"
          style={{display:'block'}}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true">
        </ins>
        And add: (adsbygoogle = window.adsbygoogle || []).push({}) in useEffect
      */}
      <span className="text-[10px] text-muted-foreground/30">
        {label || `Advertisement · Slot: ${slot}`}
      </span>
    </div>
  );
}
