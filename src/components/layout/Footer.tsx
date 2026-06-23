import { Heart, Coffee, Shield, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 px-6 py-4 flex-shrink-0">
      {/* AdSense Footer Banner */}
      <div className="w-full h-12 mb-3 rounded-lg border border-dashed border-border/40 flex items-center justify-center text-xs text-muted-foreground/30">
        {/* AdSense: footer-leaderboard */}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            100% Private & Serverless
          </span>
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-cyan-400" />
            Works Offline (PWA)
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://www.buymeacoffee.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors font-medium"
          >
            <Coffee className="w-3.5 h-3.5" />
            Buy Me a Coffee
          </a>
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-rose-400 mx-0.5" /> for productivity
          </span>
        </div>
      </div>
    </footer>
  );
}
