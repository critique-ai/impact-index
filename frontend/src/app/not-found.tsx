import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Site Not Found</h1>
        <p className="text-muted-foreground mb-8">
          Sorry, we don't support this platform/user. They may not exist, or we may not support this platform yet. Either way, Check back later!
        </p>
        <Link
          href="/"
          className="inline-flex items-center text-primary hover:text-primary/80"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}