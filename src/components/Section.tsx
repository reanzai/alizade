import React, { ReactNode } from 'react';

export function Section({ title, description, children }: { title: string, description: string, children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-black tracking-tighter text-white">{title}</h3>
        <p className="text-xs text-gray-500 font-medium">{description}</p>
      </div>
      {children}
    </div>
  );
}
