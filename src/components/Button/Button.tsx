import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@lib/cn';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm';
};
export default function Button({ variant='primary', size, className, ...rest }: Props) {
  return <button className={cn('button', `button--${variant}`, size && `button--${size}`, className)} {...rest} />;
}
