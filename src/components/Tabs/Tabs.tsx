'use client';
import { useState } from 'react';

export default function Tabs({ tabs }: { tabs: { id:string; title:string; content:React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find(t => t.id === active);
  return (
    <div className="tabs">
      <div className="tabs__bar">
        {tabs.map(t => (
          <button key={t.id} className={`tabs__btn ${active===t.id?'tabs__btn--active':''}`} onClick={()=>setActive(t.id)}>
            {t.title}
          </button>
        ))}
      </div>
      <div className="tabs__panel">{current?.content}</div>
    </div>
  );
}
