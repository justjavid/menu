import { UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-primary font-bold text-xl font-headline", className)}>
      <UtensilsCrossed className="h-6 w-6" />
      <span>Zesty Menu</span>
    </div>
  );
}
