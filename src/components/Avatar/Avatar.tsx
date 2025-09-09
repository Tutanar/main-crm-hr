import clsx from 'clsx';
export default function Avatar({ text, tone='pink' }: { text: string; tone?: 'pink'|'blue'|'green'|'indigo' }) {
  return <div className={clsx('avatar', `avatar--${tone}`)}>{text}</div>;
}
