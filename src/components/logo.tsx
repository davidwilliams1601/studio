import Link from 'next/link';
import { Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'flex items-center gap-2 text-xl font-bold text-foreground',
        className
      )}
    >
      <div className="rounded-sm bg-primary p-1.5 text-primary-foreground">
        <Linkedin className="h-5 w-5" />
      </div>
      <span className="font-headline">LinkStream</span>
    </Link>
  );
}
