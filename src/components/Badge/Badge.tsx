import clsx from 'clsx';

export default function Badge({ children, tone='gray' }: { children: React.ReactNode; tone?: 'blue'|'yellow'|'green'|'red'|'gray' }) {
  return <span className={clsx('badge', `badge--${tone}`)}>{children}</span>;
}
//хуй знает что это такое
