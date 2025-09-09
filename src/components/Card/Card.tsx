import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/cn';

export default function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('card', className)}>{children}</div>;
}

export function Panel({ title, right, children }: PropsWithChildren<{ title: string; right?: React.ReactNode }>) {
  return (
    <div className="card card--panel">
      <div className="card__head"><div className="title">{title}</div><div>{right}</div></div>
      <div className="card__body">{children}</div>
    </div>
  );
}
