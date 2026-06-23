import { Link } from 'react-router-dom';
import { Home, Wrench } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8 animate-fade-in">
      <div className="text-7xl font-black gradient-text">404</div>
      <div className="text-center">
        <h1 className="text-xl font-bold text-foreground mb-2">Page Not Found</h1>
        <p className="text-muted-foreground text-sm max-w-xs">
          The tool or page you're looking for doesn't exist yet. Check back soon!
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
        >
          <Home className="w-4 h-4" />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
